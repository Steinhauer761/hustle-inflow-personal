import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const { title, author, text_url, cover_image_url } = await req.json();

        if (!text_url) {
            return Response.json({ error: "No text format available for this book." }, { status: 400 });
        }

        // Fetch the raw text content
        const textRes = await fetch(text_url);
        const fullText = await textRes.text();
        
        // Very basic parsing to skip the Project Gutenberg boilerplate headers
        let startIndex = fullText.indexOf("*** START OF");
        if (startIndex > -1) {
            startIndex = fullText.indexOf("\n", startIndex) + 1;
        } else {
            startIndex = 0;
        }
        
        // Take a robust excerpt so it reads well but doesn't overwhelm the TTS generator 
        // (~15,000 chars is roughly 2,500-3,000 words, a solid chapter/bedtime read)
        let content = fullText.substring(startIndex, startIndex + 15000).trim();
        
        if (fullText.length > startIndex + 15000) {
            content += "\n\n... [Excerpt End. Use the full version online for more.]";
        }

        // Create the entity
        const newStory = await base44.asServiceRole.entities.BedtimeStory.create({
            title: title || 'Imported Story',
            author: author || 'Unknown',
            content,
            cover_image_url,
            target_audience: "adults", // default, can be edited by user later
            created_by_id: user?.id || null
        });

        return Response.json({ success: true, story: newStory });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});