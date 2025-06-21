// src/utils/generateSoapNote.js

export default function generateSoapNote(rawText, noteType) {
    return `S: Subjective (from your note type: ${noteType})\n${rawText}\n\nO: Objective\n[Add objective findings]\n\nA: Assessment\n[Add assessment]\n\nP: Plan\n[Add plan]`;
  }
  