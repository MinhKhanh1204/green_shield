import React from 'react'
import { Row, Col, Typography, Space } from 'antd'
import { useTranslation } from 'react-i18next'
import Marquee from '../components/Marquee'

// Material Symbols icon as a span. Font is loaded in index.html
const MSRIcon = ({ name, color = 'var(--color-bg)', size = 32 }) => (
  <span
    className="material-symbols-rounded"
    aria-hidden
    style={{ fontSize: size, lineHeight: 1, color, backgroundColor: 'var(--color-primary)', borderRadius: '50%', padding: 8 }}
  >
    {name}
  </span>
)

export default function AboutSection(){
  const { t } = useTranslation()
  return (
    <section id="about" className="section">
      <div className="container">
        <Typography.Title level={1} className="fade-up" style={{textAlign:'center', fontWeight: 'bold'}}>
          {t('about.title') || 'About Us'}
        </Typography.Title>
        <Row gutter={[24,24]} style={{marginTop:8}}>
          <Col xs={24}>
            <Typography.Paragraph className="fade-up" style={{fontSize:16, margin: '0 auto', maxWidth: 900, textAlign: 'center'}}>
              {t('about.body') || 'We upcycle local by-products into bio-based packaging for fruits, aiming to reduce plastics, clean rivers, and create local jobs while meeting export standards.'}
            </Typography.Paragraph>
          </Col>
        </Row>
        <Row gutter={[24,24]} style={{marginTop:24}}>
          <Col xs={24} md={8}>
            <div className="about-card fade-up">
              <MSRIcon name="nest_eco_leaf" />
              <div>
                <Typography.Text strong>{t('about.features.environment.title') || 'Environment'}</Typography.Text>
                <Typography.Paragraph style={{marginTop:6, marginBottom:0}}>
                  {t('about.features.environment.desc') || 'Bio materials that decompose naturally to reduce plastic waste.'}
                </Typography.Paragraph>
              </div>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="about-card fade-up">
              <MSRIcon name="publish"/>
              <div>
                <Typography.Text strong>{t('about.features.export.title') || 'Export-ready'}</Typography.Text>
                <Typography.Paragraph style={{marginTop:6, marginBottom:0}}>
                  {t('about.features.export.desc') || 'Durable design that meets logistics tests and traceability needs.'}
                </Typography.Paragraph>
              </div>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="about-card fade-up">
              <MSRIcon name="work"/>
              <div>
                <Typography.Text strong>{t('about.features.jobs.title') || 'Local jobs'}</Typography.Text>
                <Typography.Paragraph style={{marginTop:6, marginBottom:0}}>
                  {t('about.features.jobs.desc') || 'Sourcing from farmers and creating stable local employment.'}
                </Typography.Paragraph>
              </div>
            </div>
          </Col>
        </Row>
      </div>
      {/* Full-width marquee bar */}
      <Marquee
        className="section-marquee section-marquee--about"
        items={t('ticker.about', { returnObjects: true })}
        separator={<span className="material-symbols-rounded">asterisk</span>}
        speed={28}
      />
    </section>
  )
}
