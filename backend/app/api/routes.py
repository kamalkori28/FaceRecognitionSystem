from __future__ import annotations

import json

from flask import Blueprint, jsonify, request

from app.models.entities import Person
from app.services.activity_service import activity_service
from app.services.attendance_service import attendance_service
from app.services.auth_service import auth_service
from app.services.dataset_service import dataset_service
from app.services.encoding_service import encoding_service
from app.services.recognition_service import recognition_service
from app.services.realtime_hub import realtime_hub


api_bp = Blueprint("api", __name__)


@api_bp.post("/auth/login")
def login():
    payload = request.get_json(force=True)
    token, user = auth_service.authenticate(
        payload.get("email", "").strip(),
        payload.get("password", "").strip(),
    )
    if not token or not user:
        return jsonify({"message": "Invalid email or password"}), 401

    activity_service.log(level="auth", message=f"{user.email} signed in")
    return jsonify(
        {
            "token": token,
            "user": user.to_dict(),
            "defaults": {
                "frameIntervalMs": recognition_service.system_status()["frameIntervalMs"],
            },
        }
    )


@api_bp.post("/auth/logout")
@auth_service.login_required
def logout(current_user):
    activity_service.log(level="auth", message=f"{current_user.email} signed out")
    return jsonify({"ok": True})


@api_bp.get("/auth/me")
@auth_service.login_required
def me(current_user):
    return jsonify({"user": current_user.to_dict()})


@api_bp.get("/system/overview")
@auth_service.login_required
def overview(current_user):
    return jsonify(
        {
            "systemStatus": recognition_service.system_status(),
            "analytics": attendance_service.analytics_summary(),
            "recentAttendance": attendance_service.recent_records(),
            "logs": activity_service.snapshot(),
        }
    )


@api_bp.get("/persons")
@auth_service.login_required
def persons(current_user):
    return jsonify({"items": dataset_service.list_people()})


@api_bp.post("/persons")
@auth_service.login_required
def create_person(current_user):
    payload = request.get_json(force=True)
    name = payload.get("name", "").strip()
    employee_code = payload.get("employeeCode", "").strip()
    department = payload.get("department", "").strip()

    if not name or not employee_code:
        return jsonify({"message": "Name and employee code are required"}), 400

    existing = Person.query.filter_by(employee_code=employee_code.upper()).first()
    if existing:
        return jsonify({"message": "Employee code already exists"}), 409

    person = dataset_service.create_person(name, employee_code, department or None)
    return jsonify({"item": person.to_dict()}), 201


@api_bp.post("/persons/<person_id>/images")
@auth_service.login_required
def upload_images(person_id: str, current_user):
    payload = request.get_json(force=True)
    images = payload.get("images", [])
    if len(images) < 1:
        return jsonify({"message": "At least one image is required"}), 400

    person = dataset_service.get_person(person_id)
    if not person:
        return jsonify({"message": "Person not found"}), 404

    saved = dataset_service.save_captured_images(person, images)
    return jsonify(saved)


@api_bp.post("/encodings/rebuild")
@auth_service.login_required
def rebuild_encodings(current_user):
    result = encoding_service.rebuild()
    recognition_service.refresh_known_faces()
    realtime_hub.broadcast("status:update", recognition_service.system_status())
    return jsonify(result)


@api_bp.get("/attendance/today")
@auth_service.login_required
def today_attendance(current_user):
    return jsonify({"items": attendance_service.today_records()})


@api_bp.get("/attendance/history")
@auth_service.login_required
def history_attendance(current_user):
    limit = min(int(request.args.get("limit", "100")), 250)
    return jsonify({"items": attendance_service.recent_records(limit=limit)})


@api_bp.get("/analytics/summary")
@auth_service.login_required
def analytics_summary(current_user):
    days = min(int(request.args.get("days", "7")), 30)
    return jsonify(attendance_service.analytics_summary(days=days))


def _authorize_socket() -> bool:
    token = request.args.get("token", "")
    payload = auth_service.decode_token(token)
    return payload is not None


def register_websocket_routes(sock) -> None:
    @sock.route("/ws/events")
    def events(ws):
        if not _authorize_socket():
            ws.close()
            return

        realtime_hub.connect(ws)
        ws.send(
            json.dumps(
                {
                    "event": "bootstrap",
                    "data": {
                        "systemStatus": recognition_service.system_status(),
                        "analytics": attendance_service.analytics_summary(),
                        "recentAttendance": attendance_service.recent_records(),
                        "logs": activity_service.snapshot(),
                    },
                }
            )
        )

        try:
            while True:
                message = ws.receive()
                if message is None:
                    break
                if message == "ping":
                    ws.send(json.dumps({"event": "pong", "data": {}}))
        finally:
            realtime_hub.disconnect(ws)

    @sock.route("/ws/recognition")
    def recognition(ws):
        if not _authorize_socket():
            ws.close()
            return

        recognition_service.stream_opened()
        try:
            while True:
                raw_message = ws.receive()
                if raw_message is None:
                    break

                try:
                    message = json.loads(raw_message)
                except json.JSONDecodeError:
                    ws.send(json.dumps({"event": "recognition:error", "data": {"message": "Invalid payload"}}))
                    continue

                if message.get("type") != "frame":
                    continue

                try:
                    result = recognition_service.process_frame(message["image"])
                    ws.send(json.dumps({"event": "recognition:result", "data": result}))
                except Exception as exc:
                    activity_service.log(level="error", message="Recognition pipeline failed", context={"error": str(exc)})
                    ws.send(
                        json.dumps(
                            {
                                "event": "recognition:error",
                                "data": {"message": str(exc)},
                            }
                        )
                    )
        finally:
            recognition_service.stream_closed()
