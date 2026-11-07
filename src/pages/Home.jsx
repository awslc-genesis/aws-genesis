import logo from '@/assets/logo.webp'

export default function Home() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 text-center">
      <img src={logo} alt="AWS Learning Club - Genesis logo" className="size-48 sm:size-64" />
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">AWS Learning Club – Genesis</h1>
      <p className="text-muted-foreground">Tarlac State University</p>
    </main>
  )
}
