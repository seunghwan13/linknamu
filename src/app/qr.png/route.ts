import QRCode from "qrcode";
import { siteUrl } from "@/data/profile";

// 사이트 주소 QR 코드 (명함·발표 자료용으로 인쇄해도 깨지지 않도록 크게 생성)
export async function GET() {
  const png = await QRCode.toBuffer(siteUrl, { width: 1024, margin: 2, errorCorrectionLevel: "M" });

  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
}
