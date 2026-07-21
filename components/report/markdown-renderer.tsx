'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const rendered = useMemo(() => {
    if (!content) return null

    const lines = content.split('\n')
    const elements: React.ReactNode[] = []
    let listItems: string[] = []

    lines.forEach((line, index) => {
      // Handle headings
      if (line.startsWith('# ')) {
        if (listItems.length > 0) {
          elements.push(
            <ul key={`list-${elements.length}`} className="list-disc list-inside mb-4 space-y-1">
              {listItems.map((item, i) => (
                <li key={i} className="text-gray-300 text-sm md:text-base">
                  {parseInlineFormatting(item)}
                </li>
              ))}
            </ul>
          )
          listItems = []
        }

        elements.push(
          <motion.h1
            key={index}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-white my-6 leading-tight"
          >
            {parseInlineFormatting(line.replace(/^# /, ''))}
          </motion.h1>
        )
      }
      // Handle subheadings (##)
      else if (line.startsWith('## ')) {
        if (listItems.length > 0) {
          elements.push(
            <ul key={`list-${elements.length}`} className="list-disc list-inside mb-4 space-y-1">
              {listItems.map((item, i) => (
                <li key={i} className="text-gray-300 text-sm md:text-base">
                  {parseInlineFormatting(item)}
                </li>
              ))}
            </ul>
          )
          listItems = []
        }

        elements.push(
          <motion.h2
            key={index}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-2xl md:text-3xl font-bold text-white mt-6 mb-3 leading-tight"
          >
            {parseInlineFormatting(line.replace(/^## /, ''))}
          </motion.h2>
        )
      }
      // Handle subheadings (###)
      else if (line.startsWith('### ')) {
        if (listItems.length > 0) {
          elements.push(
            <ul key={`list-${elements.length}`} className="list-disc list-inside mb-3 space-y-1">
              {listItems.map((item, i) => (
                <li key={i} className="text-gray-300 text-sm md:text-base">
                  {parseInlineFormatting(item)}
                </li>
              ))}
            </ul>
          )
          listItems = []
        }

        elements.push(
          <motion.h3
            key={index}
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl font-semibold text-white/90 mt-4 mb-2"
          >
            {parseInlineFormatting(line.replace(/^### /, ''))}
          </motion.h3>
        )
      }
      // Handle bullet lists
      else if (line.trim().startsWith('- ')) {
        listItems.push(line.trim().replace(/^- /, ''))
      }
      // Handle paragraphs
      else if (line.trim().length > 0) {
        if (listItems.length > 0) {
          elements.push(
            <ul key={`list-${elements.length}`} className="list-disc list-inside mb-4 space-y-1">
              {listItems.map((item, i) => (
                <li key={i} className="text-gray-300 text-sm md:text-base">
                  {parseInlineFormatting(item)}
                </li>
              ))}
            </ul>
          )
          listItems = []
        }

        elements.push(
          <motion.p
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="text-gray-200 text-sm md:text-base leading-relaxed mb-4 text-justify"
          >
            {parseInlineFormatting(line)}
          </motion.p>
        )
      }
      // Handle empty lines
      else if (listItems.length > 0 && line.trim().length === 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc list-inside mb-4 space-y-1">
            {listItems.map((item, i) => (
              <li key={i} className="text-gray-300 text-sm md:text-base">
                {parseInlineFormatting(item)}
              </li>
            ))}
          </ul>
        )
        listItems = []
        elements.push(<div key={`spacing-${elements.length}`} className="mb-2" />)
      }
    })

    // Flush remaining list items
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc list-inside mb-4 space-y-1">
          {listItems.map((item, i) => (
            <li key={i} className="text-gray-300 text-sm md:text-base">
              {parseInlineFormatting(item)}
            </li>
          ))}
        </ul>
      )
    }

    return elements
  }, [content])

  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      {rendered}
    </div>
  )
}

function parseInlineFormatting(text: string): React.ReactNode {
  // Parse **bold**, *italic*, etc. using simple text replacement
  const boldRegex = /\*\*([^*]+)\*\*/g
  const italicRegex = /\*([^*]+)\*/g

  let parts: React.ReactNode[] = []
  let lastIndex = 0
  let tempText = text

  // Handle bold
  let boldMatch
  const boldRegexGlobal = /\*\*([^*]+)\*\*/g
  while ((boldMatch = boldRegexGlobal.exec(text)) !== null) {
    // For now, just return text with HTML entities (safe)
    tempText = tempText.replace(/\*\*([^*]+)\*\*/g, (match, content) => `__BOLD__${content}__BOLD_END__`)
  }

  // Simple approach: return text with markers replaced
  return (
    <span>
      {tempText
        .split('__BOLD__')
        .map((part, i) => {
          if (i === 0) return part
          const [content, rest] = part.split('__BOLD_END__')
          return (
            <React.Fragment key={i}>
              <strong>{content}</strong>
              {rest}
            </React.Fragment>
          )
        })}
    </span>
  )
}
