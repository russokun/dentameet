// Canales de contacto públicos de DentaMeet. El correo @dentameet.net dejó de funcionar
// cuando venció el dominio; WhatsApp es el canal principal mientras no haya otro.

export const WHATSAPP_NUMBER = '56957384302'
export const WHATSAPP_DISPLAY = '+56 9 5738 4302'

export const whatsappUrl = (text) =>
  `https://wa.me/${WHATSAPP_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ''}`

export const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/pacientefacil/',
  tiktok: 'https://www.tiktok.com/@dentameet_pacientefacil',
  linkedin: 'https://www.linkedin.com/company/pacientef%C3%A1cil/',
}
