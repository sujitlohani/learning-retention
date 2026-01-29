'use client';

import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const { login } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center bg-background dot-grid p-4">
            <div className="w-full max-w-sm animate-slide-up">
                <Card className="border shadow-lg">
                    <CardHeader className="text-center space-y-4 pt-8 pb-2">
                        <div className="mx-auto p-4 bg-primary/10 rounded-2xl w-fit">
                            <Brain className="w-10 h-10 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-bold">
                                Learning<span className="text-primary">Loop</span>
                            </CardTitle>
                            <CardDescription>
                                Your brain's best friend for lasting memory
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4 pb-8">
                        <Button
                            size="lg"
                            className="w-full h-12 font-semibold"
                            onClick={login}
                        >
                            Start Learning
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                            Demo mode • Data saved locally
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
