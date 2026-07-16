import pptxgen from 'pptxgenjs'

type Slide = {
  id: string
  title: string
  content: string
  imageUrl?: string | null
  notes?: string | null
}

export async function exportToPptx(title: string, slides: Slide[]) {
  const pptx = new pptxgen()
  pptx.layout = 'LAYOUT_16x9'

  slides.forEach((slide) => {
    const pptxSlide = pptx.addSlide()

    // Slide background
    pptxSlide.background = { color: 'F8FAFC' }

    // Slide Title
    pptxSlide.addText(slide.title, {
      x: 0.5,
      y: 0.6,
      w: 9.0,
      h: 0.8,
      fontSize: 28,
      bold: true,
      color: '0F172A',
      fontFace: 'Arial',
    })

    // Slide Content (with bullet formatting support)
    const bulletLines = slide.content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => ({ text: line.replace(/^-\s*/, ''), options: { bullet: true } }))

    if (bulletLines.length > 0) {
      pptxSlide.addText(bulletLines, {
        x: 0.5,
        y: 1.5,
        w: slide.imageUrl ? 5.0 : 9.0,
        h: 4.5,
        fontSize: 16,
        color: '334155',
        fontFace: 'Arial',
        valign: 'top',
      })
    }

    // Slide Image (if present)
    if (slide.imageUrl) {
      pptxSlide.addImage({
        path: slide.imageUrl,
        x: 5.8,
        y: 1.5,
        w: 3.7,
        h: 4.0,
      })
    }

    // Presenter Notes
    if (slide.notes) {
      pptxSlide.addNotes(slide.notes)
    }
  })

  const sanitizedFileName = title.replace(/[/\\?%*:|"<>\s]+/g, '_') || 'presentation'
  await pptx.writeFile({ fileName: `${sanitizedFileName}.pptx` })
}
