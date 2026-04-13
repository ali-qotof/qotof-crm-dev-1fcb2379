import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send } from "lucide-react";

export default function TicketDetail() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/support"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h2 className="text-lg font-semibold">تذكرة {id}</h2>
        <Badge>مفتوح</Badge>
        <Badge variant="destructive">عالي</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">سجل الأحداث</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">لا توجد أحداث بعد</p>
            </CardContent>
          </Card>

          {/* Add comment */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex gap-2">
                <Textarea placeholder="أضف تعليق..." rows={2} className="flex-1" />
                <Button size="icon" className="shrink-0 self-end">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">تفاصيل التذكرة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div><span className="text-muted-foreground">العميل:</span> —</div>
            <div><span className="text-muted-foreground">الطلب:</span> —</div>
            <div><span className="text-muted-foreground">المسؤول:</span> —</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
