import * as React from 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      math: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
      mrow: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
      mtable: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
      mtr: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
      mtd: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
      mn: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
      mo: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
    }
  }
}
