export const formatMessageContent = (content: string) => {
    if (!content) return content;

    // Process bold text
    let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Process headings
    formatted = formatted
        .replace(/^####\s+(.*?)$/gm, '<h4 class="text-base font-semibold mt-1 mb-0">$1</h4>')
        .replace(/^###\s+(.*?)$/gm, '<h3 class="text-lg font-semibold mt-1 mb-0">$1</h3>')
        .replace(/^##\s+(.*?)$/gm, '<h2 class="text-xl font-bold mt-2 mb-1">$1</h2>')
        .replace(/^#\s+(.*?)$/gm, '<h1 class="text-2xl font-bold mt-3 mb-2">$1</h1>');

    // Process lists with proper nesting
    const lines = formatted.split('\n');
    let inList = false;
    let listItems: string[] = [];
    let result: string[] = [];

    const processList = () => {
        if (listItems.length > 0) {
            const listHtml = `<ul class="my-0 pl-4 space-y-1 list-disc">${listItems.join('')}</ul>`;
            result.push(listHtml);
            listItems = [];
        }
    };

    lines.forEach(line => {
        const isListItem = line.trim().match(/^[-*+]\s+/);
        const isNestedListItem = line.trim().match(/^\s+[-*+]\s+/);

        if (isListItem || isNestedListItem) {
            const level = (line.match(/^\s*/) || [''])[0].length;
            const content = line.trim().substring(2);
            const listItem = `<li class="pl-${Math.min(level + 1, 4)}">${content}</li>`;
            listItems.push(listItem);
            inList = true;
        } else {
            if (inList) {
                processList();
                inList = false;
            }
            result.push(line);
        }
    });

    processList(); // Process any remaining list items
    formatted = result.join('\n');

    // Process paragraphs and other block elements
    formatted = formatted
        .split('\n\n')
        .map(block => {
            block = block.trim();
            if (!block) return '';

            // Skip processing if already a list or heading
            if (block.startsWith('<ul>') || block.startsWith('<h')) {
                return block;
            }

            // Handle blockquotes
            if (block.startsWith('> ')) {
                return `<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600">${block.substring(2)}</blockquote>`;
            }

            // Handle horizontal rules
            if (block === '---' || block === '***' || block === '___') {
                return '<hr class="my-2 border-gray-200" />';
            }

            // Handle paragraphs that end with : (section headers)
            if (block.endsWith(':')) {
                return `<p class="font-semibold text-lg mb-0">${block}</p>`;
            }

            // Regular paragraphs
            return `<p class="mb-0">${block}</p>`;
        })
        .filter(Boolean)
        .join('\n');

    // Process inline elements that might be left
    formatted = formatted
        .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>') // Inline code
        .replace(/\*([^*]+)\*/g, '<em>$1</em>') // Italics
        .replace(/\n/g, '<br />'); // Line breaks

    return formatted;
};
