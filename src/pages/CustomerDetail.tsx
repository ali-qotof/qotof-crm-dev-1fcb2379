import { useParams } from "react-router-dom";

export default function CustomerDetail() {
  const { id } = useParams();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">تفاصيل العميل</h1>
      <p className="text-muted-foreground">معرف العميل: {id}</p>
    </div>
  );
}
