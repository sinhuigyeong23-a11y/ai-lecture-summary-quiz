import Button from '../components/Button'
import StarBackground from '../components/StarBackground'
import { mainPageContent as content } from '../data/mainPage'
import './MainPage.css'

export default function MainPage() {
  return (
    <StarBackground>
      <div className="main">
        <header className="main__header">
          <span className="main__brand">{content.brand}</span>
        </header>

        <section className="main__hero">
          <h1 className="main__title">
            {content.titleLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h1>
          <p className="main__subtitle">{content.subtitle}</p>
        </section>

        <section className="main__horizon">
          <p className="main__desc">{content.description}</p>
          <Button href={content.cta.href}>{content.cta.label}</Button>
          <p className="main__login">
            {content.login.question}
            <Button variant="text" href={content.login.href}>
              {content.login.label}
            </Button>
          </p>
        </section>
      </div>
    </StarBackground>
  )
}
