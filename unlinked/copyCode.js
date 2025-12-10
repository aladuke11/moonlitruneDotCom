function copyToClipboard(element) {
  const code = element.textContent;
  navigator.clipboard.writeText(code).then(() => {
    const button = document.querySelector('.copyButton');
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    setTimeout(() => {
      button.textContent = originalText;
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const codeSnip = document.querySelector('.codeSnip');
  const copyButton = document.querySelector('.copyButton');
  
  if (copyButton && codeSnip) {
    copyButton.onclick = () => copyToClipboard(codeSnip);
  }
});
