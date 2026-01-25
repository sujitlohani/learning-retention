'use client';

import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle2 } from 'lucide-react';

export default function LoginPage() {
    const { login } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
            <Card className="max-w-md w-full shadow-lg border-2">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                        <UserCircle2 className="w-12 h-12 text-primary" />
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-2xl font-bold">Welcome Student</CardTitle>
                        <CardDescription>
                            Select a profile to start your learning session.
                            <br />
                            <span className="text-xs text-muted-foreground">(Demo Mode: No password required)</span>
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button size="lg" className="w-full text-lg h-14" onClick={login}>
                        Login as Demo Student
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                        Session active for this browser tab only.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
