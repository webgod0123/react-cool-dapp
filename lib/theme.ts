/**
 * Grommet Theme
 *
 * https://v2.grommet.io/grommet
 */
interface ITheme {
  global: {
    font: {
      [key: string]: any
    }
    colors: {
      [key: string]: any
    }
    breakpoints: {
      [key: string]: {
        [key: string]: number
      }
    }
  }
  text: {
    [key: string]: {
      [key: string]: string
    }
  }
  layer: {
    [key: string]: any
  }
  tip: any
}

const grommetTheme: ITheme = {
  global: {
    font: {
      family: 'Helvetica',
    },
    colors: {
      clrPrimary: 'var(--umee-color-primary)',
      clrSupply: 'var(--umee-full-pink)',
      clrBorrow: 'var(--umee-full-green)',
      clrDark: 'var(--umee-full-dark)',
      clrDarkGreyOnNavy: 'var(--umee-dark-grey-on-navy)',
      clrWhite: 'var(--umee-full-white)',
      clrMidGreyOnNavy: 'var(--umee-mid-grey-on-navy)',
      clrOffWhiteBlue: 'var(--umee-full-grey1)',
      clrIconOff: 'var(--umee-full-grey2)',
      clrBackground: {
        light: 'clrWhite',
        dark: 'clrPrimary',
      },
      clrTextPrimary: {
        light: 'clrPrimary',
        dark: 'clrWhite',
      },
      clrTextSecondary: {
        light: 'clrDarkGreyOnNavy',
        dark: 'clrMidGreyOnNavy',
      },
      clrBorder: {
        light: 'clrMidGreyOnNavy',
        dark: 'clrDarkGreyOnNavy',
      },
      clrBorderGrey: {
        light: 'clrOffWhiteBlue',
        dark: 'clrDarkGreyOnNavy',
      },
      clrModalBackground: {
        light: 'clrWhite',
        dark: 'clrDark',
      },
      clrSideNavBorder: {
        light: 'clrPrimary',
        dark: 'clrDarkGreyOnNavy',
      },
      clrBoxBorder: {
        light: 'clrWhite',
        dark: 'clrDarkGreyOnNavy',
      },
      clrDataListHeader: {
        light: 'clrPrimary',
        dark: 'clrWhite',
      },
      clrBarRailBackground: {
        light: 'clrWhite',
        dark: 'clrMidGreyOnNavy',
      },
      clrRailBackground: {
        light: 'clrMidGreyOnNavy',
        dark: 'clrWhite',
      },
      clrButtonBorderGrey: {
        light: 'clrOffWhiteBlue',
        dark: 'clrIconOff',
      },
      clrScale: {
        light: 'clrMidGreyOnNavy',
        dark: 'clrWhite',
      },
      clrTextGrey: {
        light: 'clrMidGreyOnNavy',
        dark: 'clrIconOff',
      },
      clrThumbBorder: {
        light: 'clrBorrow',
        dark: 'clrWhite',
      },
      clrSupplyText: {
        light: 'clrPrimary',
        dark: 'clrSupply',
      },
      clrBorrowText: {
        light: 'clrPrimary',
        dark: 'clrBorrow',
      },
      clrTabDisabled: 'clrMidGreyOnNavy',
      clrBoxGradient: 'var(--umee-gradient)',
      clrDefaultBGAndText: 'var(--umee-full-white)',
      clrNavLinkDefault: 'var(--umee-full-grey2)',
      clrOverlayLight: 'var(--umee-overlay)',
      clrOverlayDark: 'var(--umee-overlay-dark)',
      clrDanger: 'var(--umee-full-red)',
      clrSupplyOpacity: {
        light: 'clrOffWhiteBlue',
        dark: 'var(--umee-full-pink-50)'
      },
      clrBorrowOpacity: {
        light: 'clrOffWhiteBlue',
        dark: 'var(--umee-full-green-50)'
      },
    },
    breakpoints: {
      small: { value: 568 },
      medium: { value: 768 },
      large: { value: 1024 },
      xlarge: { value: 1280 },
      xxlarge: { value: 1536 },
    },
  },
  text: {
    xsmall: {
      size: '11px',
    },
    small: {
      size: '15px',
    },
    medium: {
      size: '20px',
    },
    medium1: {
      size: '32px',
    },
    large: {
      size: '44px',
    },
    xlarge: {
      size: '54px',
    },
  },
  layer: {
    overlay: {
      background: {
        light: 'clrOverlayLight',
        dark: 'clrOverlayDark',
      },
    },
    responsiveBreakpoint: '',
  },
  tip: {
    content: {
      background: 'white',
      pad: 'xsmall',
    },
    drop: {
      round: 'xsmall',
      elevation: 'small',
    },
  },
}

export default grommetTheme
