import { useParams } from "react-router-dom";

export default function TicketDetail() {
  const { id } = useParams();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">تفاصيل التذكرة</h1>
      <p className="text-muted-foreground">معرف التذكرة: {id}</p>
    </div>
  );
}
