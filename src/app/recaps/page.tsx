import { Container } from "@/components/site/Container";

export const runtime = "nodejs";

export default function RecapsPage() {
  return (
    <div className="py-12 sm:py-16">
      <Container className="max-w-2xl">
        <h1 className="font-serif text-2xl font-semibold tracking-tight mb-4">
          Recaps
        </h1>
        <p className="text-muted-foreground">
          리캡은 선생님이 공유한 링크로만 볼 수 있습니다. 링크를 받으셨다면 해당 주소로 접속해 주세요.
        </p>
      </Container>
    </div>
  );
}
