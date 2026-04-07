import Link from 'next/link'
import './not-found.css'

export default function NotFound() {
  return (
    <div className="not-found-body">
      <main className="not-found-main">
        <div>
          <div>
            <span>erro 404</span>
            <span>Página não encontrada</span>
          </div>
          <svg viewBox="0 0 200 600">
            <polygon points="118.302698 8 59.5369448 66.7657528 186.487016 193.715824 14 366.202839 153.491505 505.694344 68.1413353 591.044514 200 591.044514 200 8" />
          </svg>
        </div>
        <svg className="crack" viewBox="0 0 200 600">
          <polyline points="118.302698 8 59.5369448 66.7657528 186.487016 193.715824 14 366.202839 153.491505 505.694344 68.1413353 591.044514" />
        </svg>
        <div>
          <svg viewBox="0 0 200 600">
            <polygon points="118.302698 8 59.5369448 66.7657528 186.487016 193.715824 14 366.202839 153.491505 505.694344 68.1413353 591.044514 0 591.044514 0 8" />
          </svg>
          <div>
            <span>desculpa por isso!</span>
            <span>
              <Link href="/">
                <b>Voltar para página inicial</b>
              </Link>
            </span>
          </div>
        </div>
      </main>
    </div>
  )
}
