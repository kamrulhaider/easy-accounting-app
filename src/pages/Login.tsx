import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await login(formData.email, formData.password);
            navigate("/");
        } catch (err: any) {
            setError(err.message || "Invalid email or password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gray-50/50 p-4">
            <Card className="w-full max-w-sm border-0 shadow-lg sm:border sm:shadow-sm bg-white">
                <CardHeader className="space-y-2 text-center">
                    <div className="flex justify-center mb-3">
                        <img
                            src="/logo.png"
                            alt="Easy Accounting Logo"
                            className="h-16 object-contain"
                        />
                    </div>
                    <CardTitle className="text-2xl font-semibold tracking-tight">
                        Welcome back
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                        Sign in to your account
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="grid gap-4">
                        {error && (
                            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                                {error}
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email or Username</Label>
                            <Input
                                id="email"
                                type="text"
                                placeholder="name@example.com"
                                required
                                className="bg-transparent"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                className="bg-transparent"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="remember" />
                            <Label
                                htmlFor="remember"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Remember me
                            </Label>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading ? "Signing in..." : "Sign in"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
