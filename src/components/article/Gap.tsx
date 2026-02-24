/**
 * 문단 사이 여백용.
 * 연속 <br /> 대신 마진으로 통일해 레이아웃 흐름을 맞출 때 사용.
 * 블로그/뉴스 등 콘텐츠에서 import해서 쓰세요.
 */
export function Gap({ className = "mb-4" }: { className?: string }) {
  return <span className={`block ${className}`} aria-hidden="true" />;
}
