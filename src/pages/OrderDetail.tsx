import { useParams } from "react-router-dom";

export default function OrderDetail() {
  const { id } = useParams();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">تفاصيل الطلب</h1>
      <p className="text-muted-foreground">معرف الطلب: {id}</p>
    </div>
  );
}
