import React, { memo } from 'react'
import { useTranslation } from 'react-i18next'
import logo from '../assets/logo.png'
import logolg from '../assets/logo-lg.png'
import SocialLinks from '../components/SocialLinks'

function ContactSection() {
  const { t } = useTranslation()
  const onSubscribe = (e) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const email = data.get('email')
    if (!email) return
    alert('Đăng ký thành công!')
    e.currentTarget.reset()
  }
  return (
    <section id="contact" className="section section--contact">
      <div className="contact-footer">
        {/* Newsletter panel centered vertically */}
        <div className="contact-body">
          <div className="newsletter-panel">
            <div className="nl-left">
              <h2 className="nl-title">{t('contact.newsletter.title', { defaultValue: 'Đăng ký nhận bản tin' })}</h2>
              <p className="nl-desc">{t('contact.newsletter.desc', { defaultValue: 'Đăng ký để nhận thông tin mới nhất, góc nhìn chuyên gia về vật liệu sinh học, cập nhật dự án và tác động cộng đồng.' })}</p>
            </div>
            <form className="nl-right" onSubmit={onSubscribe}>
              <label className="nl-label">{t('contact.newsletter.label', { defaultValue: 'Luôn cập nhật' })}</label>
              <div className="nl-inputs">
                <input className="nl-input" type="email" name="email" placeholder={t('contact.newsletter.placeholder', { defaultValue: 'Nhập email của bạn' })} required />
                <button className="nl-btn" type="submit">{t('contact.newsletter.cta', { defaultValue: 'Đăng ký' })}</button>
              </div>
              <small className="nl-note">{t('contact.newsletter.note', { defaultValue: 'Bằng việc đăng ký, bạn đồng ý với ' })}<a href="/privacy" target="_blank" rel="noopener noreferrer">{t('contact.newsletter.privacy', { defaultValue: 'Chính sách bảo mật' })}</a>.</small>
            </form>
          </div>
        </div>


        <div className="footer-bottom">
          {/* Site footer (3 columns like the components in the reference) */}
          <footer className="site-footer">
            {/* Brand column */}
            <div className="footer-brand">
              <div className="brand-row">
                <img src={logo} alt="logo" width="24" />
                <img src={logolg} alt="name" width="110" />
              </div>
              <p className="brand-desc">{t('footer.tagline', { defaultValue: 'Lá chắn xanh cho trái cây miền sông nước' })}</p>
              <SocialLinks />
            </div>

            {/* Services column */}
            <div className="footer-services">
              <div className="footer-heading">
                <span>{t('footer.services.title', { defaultValue: 'Chúng tôi cung cấp' })}</span>
                <span className="material-symbols-rounded" aria-hidden>arrow_outward</span>
              </div>
              <ul className="footer-items">
                {(t('footer.services.items', { returnObjects: true }) || []).map((it, idx) => (
                  <li key={idx} className="footer-item">{it}</li>
                ))}
              </ul>
            </div>

            {/* Contact column with vertical divider */}
            <div className="footer-contact">
              <div className="footer-heading">
                <span>{t('footer.contact.title', { defaultValue: 'Liên hệ với chúng tôi' })}</span>
              </div>
              <address className="contact-lines">{t('footer.contact.address', { defaultValue: 'TP. Cần Thơ, Việt Nam' })}</address>
              <div className="contact-lines"><a href="tel:0968020458">{t('footer.contact.phone', { defaultValue: '0968020458' })}</a></div>
              <div className="contact-lines"><a href="mailto:greenshieldmekong@gmail.com">{t('footer.contact.email', { defaultValue: 'greenshieldmekong@gmail.com' })}</a></div>
            </div>
          </footer>
          <div className="footer-hr" />
          <div className="footer-sitemap">
            <div className="footer-copy">© {new Date().getFullYear()} GreenShield Mekong</div>
            <div className="footer-partner">
              <span className="partner-label">{t('footer.partnerLabel', { defaultValue: 'Đối tác của' })}</span>
              <img
                src="http://res.cloudinary.com/farmcode/image/upload/v1733679777/ecoka/lmogymmqzseizprojyl0.png"
                alt={t('footer.partnerAlt', { defaultValue: 'Ecoka logo' })}
                className="partner-logo"
                loading="lazy"
              />
            </div>
          </div>
          <div className="footer-hr" />
        </div>
      </div>
    </section>
  )
}

export default memo(ContactSection)
