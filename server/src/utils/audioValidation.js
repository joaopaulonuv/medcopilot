const fs = require('fs').promises;
const path = require('path');

const validateAudioFile = async (filePath) => {
  try {
    // Check if file exists
    const stats = await fs.stat(filePath);
    
    // Check file size (max 25MB)
    const maxSize = 25 * 1024 * 1024;
    if (stats.size > maxSize) {
      throw new Error('File too large');
    }

    // Check if file is not empty
    if (stats.size === 0) {
      throw new Error('Empty file');
    }

    // Basic audio file validation by reading first few bytes
    const buffer = Buffer.alloc(12);
    const fileHandle = await fs.open(filePath, 'r');
    await fileHandle.read(buffer, 0, 12, 0);
    await fileHandle.close();

    // Check for common audio file signatures
    const audioSignatures = [
      'ftyp', // MP4/M4A
      'RIFF', // WAV
      'ID3',  // MP3
      '\xFF\xFB', // MP3
      '\xFF\xF3', // MP3
      '\xFF\xF2', // MP3
    ];

    const fileHeader = buffer.toString('ascii', 0, 4);
    const isValidAudioSignature = audioSignatures.some(sig => 
      fileHeader.includes(sig) || buffer.includes(Buffer.from(sig))
    );

    return isValidAudioSignature;

  } catch (error) {
    console.error('Audio validation error:', error);
    return false;
  }
};

module.exports = { validateAudioFile };