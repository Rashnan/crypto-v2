import { Box } from '@chakra-ui/react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

export function MathEquation({ latex }: { latex: string }) {
  const html = katex.renderToString(latex, { throwOnError: true, trust: false, strict: 'error' })
  return (
    <Box overflowX="auto" overflowY="hidden" py="6px" color="var(--text-h)" fontSize="sm" data-math-formula={latex}>
      <span dangerouslySetInnerHTML={{ __html: html }} />
    </Box>
  )
}
