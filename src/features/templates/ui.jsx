/*
  Funções gerais para facilitar construção dos componentes
*/

export function Section({ id, className = '', children }) {
  return (
    <section id={id} className={'py-12 ' + className}>
      {children}
    </section>
  );
}
export function Container({ className = '', children }) {
  return (
    <div className={'max-w-5xl mx-auto px-4 ' + className}>{children}</div>
  );
}
export function Button({ style, className = '', href, onClick, children }) {
  const Cmp = href ? 'a' : 'button';
  return (
    <Cmp
      href={href}
      onClick={onClick}
      className={`inline-block rounded border px-4 py-2 transition ${className}`}
      style={style}
    >
      {children}
    </Cmp>
  );
}
