// src/composables/useGoogleFont.js

export const fontGoogleMap = {
  'ibm-plex-sans-tc':    'IBM+Plex+Sans+TC:wght@400;600',
  'lxgw-wenkai-mono-tc': 'LXGW+WenKai+Mono+TC',
  'noto-sans-tc':        'Noto+Sans+TC:wght@400;600',
  'noto-serif-tc':       'Noto+Serif+TC:wght@400;600',
  'noto-sans-sc':        'Noto+Sans+SC:wght@400;600',
  'noto-serif-sc':       'Noto+Serif+SC:wght@400;600',
  'ibm-plex-sans-sc':    'IBM+Plex+Sans+SC:wght@400;600',
  'bona-nova':           'Bona+Nova:ital,wght@0,400;0,700;1,400',
  'inter':               'Inter:wght@400;600',
  'cormorant-garamond':  'Cormorant+Garamond:ital,wght@0,400;0,600;1,400',
  'montserrat':          'Montserrat:wght@400;600',
  'playfair-display':    'Playfair+Display:ital,wght@0,400;0,600;1,400',
}

export const loadGoogleFont = (googleFont) => {
  if (!googleFont) return
  const id = `gfont-${googleFont.replace(/[^a-zA-Z0-9]/g, '-')}`
  if (document.getElementById(id)) return
  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${googleFont}&display=swap`
  document.head.appendChild(link)
}