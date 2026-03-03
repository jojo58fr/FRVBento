import Link from 'next/link';

const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '');
const homeHref = basePath ? `${basePath}/` : '/';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-100 text-gray-900">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <div className="bg-white/90 backdrop-blur rounded-3xl border border-amber-100 shadow-xl p-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-semibold">
            Erreur 404
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mt-4">
            La page n&apos;existe pas ou le bento n&apos;a pas été publié.
          </h1>
          <p className="text-gray-600 mt-4">
            Vérifie l&apos;URL ou demande à l&apos;administrateur du bento de le publier.
          </p>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="text-sm font-semibold text-amber-900">Attention</p>
            <p className="text-sm text-amber-800 mt-1">
              Pour publier votre bento en public, vous devez cliquer sur deploy =&gt; et indiquer
              une URL valide, qui, une fois vérifiée, vous permettra de publier.
            </p>
          </div>

          <div className="mt-8">
            <Link
              href={homeHref}
              className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-gray-900 text-white font-semibold hover:bg-black transition-all shadow-md hover:shadow-lg"
            >
              Retourner à la home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
