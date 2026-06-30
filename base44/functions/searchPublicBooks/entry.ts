import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { query, topic, format } = await req.json();

        // Query the Project Gutenberg public API wrapper
        let url = `https://gutendex.com/books/?search=${encodeURIComponent(query || '')}`;
        if (topic && topic !== 'all') url += `&topic=${encodeURIComponent(topic)}`;
        if (format === 'audio') url += `&mime_type=audio`;

        const response = await fetch(url);
        const data = await response.json();

        // Format and limit results
        const books = data.results.slice(0, 15).map(book => {
            const audio_url = book.formats['audio/mpeg'] || book.formats['audio/ogg'] || null;
            const text_url = book.formats['text/plain; charset=us-ascii'] || book.formats['text/plain'] || book.formats['text/html'];
            
            return {
                id: book.id,
                title: book.title,
                author: book.authors && book.authors.length > 0 ? book.authors[0].name : 'Unknown',
                cover_image_url: book.formats['image/jpeg'],
                text_url: text_url,
                audio_url: audio_url,
                is_audio: !!audio_url || format === 'audio'
            };
        });

        return Response.json({ books });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});