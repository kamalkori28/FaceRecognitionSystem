import { motion } from "framer-motion";
import { ShieldCheck, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/auth-provider";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@facenova.ai");
  const [password, setPassword] = useState("Admin@123");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success("Welcome back", {
        description: "Premium recognition workspace is ready.",
      });
      navigate("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-background bg-aurora px-4 py-8 text-foreground lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col justify-between rounded-[36px] border border-white/10 bg-white/[0.08] p-8 backdrop-blur-2xl lg:p-10"
      >
        <div>
          <p className="font-display text-4xl font-bold lg:text-6xl">FaceNova</p>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            AI-native face recognition attendance built for premium teams that want realtime visibility, low-latency verification, and a dashboard people enjoy using.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Secure Access", copy: "JWT auth with WebSocket-aware session flow." },
            { icon: Zap, title: "Fast Recognition", copy: "Optimized frame sampling with CPU-friendly detection." },
            { icon: Sparkles, title: "SaaS UI", copy: "Glassmorphism panels with live analytics and activity streams." },
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.08, duration: 0.45 }}
                className="rounded-[28px] border border-white/10 bg-slate-950/30 p-5"
              >
                <div className="mb-4 inline-flex rounded-2xl bg-primary/20 p-3 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="font-display text-lg font-semibold">{feature.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{feature.copy}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <div className="flex items-center justify-center px-0 py-8 lg:px-10 lg:py-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="w-full max-w-lg"
        >
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Admin Login</CardTitle>
                <CardDescription>Default seeded credentials are prefilled for first boot.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
                <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" />
                <Button className="w-full" size="lg" disabled={submitting}>
                  {submitting ? "Signing in..." : "Enter Dashboard"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

