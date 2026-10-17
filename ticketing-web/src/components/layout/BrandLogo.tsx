import { Link } from 'react-router'

export function BrandLogo() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2.5 text-ink! no-underline">
      <img src="/favicon.svg" alt="" className="size-9" />
      <span className="font-display text-xl font-bold tracking-tight">FairTicket</span>
    </Link>
  )
}
