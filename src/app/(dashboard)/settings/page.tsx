import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in-50">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your company profile and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Update your company details and logo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 border">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">LC</AvatarFallback>
            </Avatar>
            <Button variant="outline">Upload New Logo</Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t">
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Name</label>
              <Input defaultValue="LogistiCore Operations Inc." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Support Email</label>
              <Input defaultValue="support@logisticore.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input defaultValue="+1 (800) 555-0199" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Timezone</label>
              <Input defaultValue="EST (Eastern Standard Time)" disabled />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Headquarters Address</label>
              <Input defaultValue="123 Logistics Way, New York, NY 10001" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end border-t bg-muted/20 px-6 py-4">
          <Button>Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

