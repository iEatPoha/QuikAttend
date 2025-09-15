import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">QuikAttend</CardTitle>
          <p className="text-muted-foreground">Professional Attendance Management</p>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Link href="/login">
            <Button size="lg" className="w-full">
              Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
