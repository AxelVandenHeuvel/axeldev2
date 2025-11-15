export function SectionHeading({ label, align = 'center' }) {
  const alignment =
    align === 'center' ? 'text-center mx-auto' : align === 'right' ? 'text-right ml-auto' : ''

  return (
    <div className={`mb-10 ${alignment}`}>
      <p className="font-heading text-4xl uppercase tracking-[0.3em] text-white sm:text-5xl">
        {label}
      </p>
    </div>
  )
}
