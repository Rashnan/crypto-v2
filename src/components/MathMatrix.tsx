export function MathMatrix({ data, compact = false }: { data: Array<Array<number | string>>; compact?: boolean }) {
  return (
    <math style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <mrow>
        <mo>(</mo>
        <mtable columnspacing={compact ? '0.3em' : '0.6em'} rowspacing={compact ? '0.2em' : '0.4em'}>
          {data.map((row, rowIndex) => (
            <mtr key={rowIndex}>
              {row.map((value, columnIndex) => (
                <mtd key={columnIndex} style={{ padding: compact ? '0.1em 0.2em' : '0.25em 0.45em', textAlign: 'center' }}>
                  <mn>{value}</mn>
                </mtd>
              ))}
            </mtr>
          ))}
        </mtable>
        <mo>)</mo>
      </mrow>
    </math>
  )
}
