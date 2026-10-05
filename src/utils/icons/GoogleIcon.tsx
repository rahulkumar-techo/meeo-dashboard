export function GoogleIcon({
  size = 20,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fill="#4285F4"
        d="M21.35 12.27c0-.79-.07-1.55-.23-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.95 2.94v2.45h3.16c1.85-1.7 2.9-4.2 2.9-7.42Z"
      />
      <path
        fill="#34A853"
        d="M12 21.99c2.65 0 4.87-.88 6.49-2.38l-3.16-2.45c-.88.59-2 .94-3.33.94-2.56 0-4.73-1.73-5.51-4.06H3.22v2.53A9.8 9.8 0 0 0 12 21.99Z"
      />
      <path
        fill="#FBBC05"
        d="M6.49 14.04A5.89 5.89 0 0 1 6.18 12c0-.71.12-1.4.31-2.04V7.43H3.22A9.99 9.99 0 0 0 2 12c0 1.61.39 3.14 1.22 4.57l3.27-2.53Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.9c1.45 0 2.75.5 3.77 1.49l2.83-2.83C16.87 2.97 14.65 2 12 2a9.8 9.8 0 0 0-8.78 5.43l3.27 2.53 0 0Z"
      />
    </svg>
  )
}