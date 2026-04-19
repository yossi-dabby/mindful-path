import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Extracts readable text content from an uploaded PDF file URL.
 * Used to give the AI agent actual PDF content to reason about,
 * since LLM vision models cannot read PDF URLs directly.
 *
 * Returns: { success: true, text: "..." } on success
 *          { success: false, error: "..." } on failure
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { file_url } = await req.json();

    if (!file_url || typeof file_url !== 'string') {
      return Response.json({ success: false, error: 'file_url is required' }, { status: 400 });
    }

    // Use ExtractDataFromUploadedFile with a generic text extraction schema
    const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: {
        type: 'object',
        properties: {
          full_text: {
            type: 'string',
            description: 'The complete extracted text content of the document, preserving structure and paragraphs as much as possible.'
          },
          page_count: {
            type: 'number',
            description: 'Number of pages in the document, if detectable.'
          }
        },
        required: ['full_text']
      }
    });

    if (result?.status === 'error' || !result?.output?.full_text) {
      return Response.json({
        success: false,
        error: result?.details || 'PDF text extraction returned no content'
      });
    }

    return Response.json({
      success: true,
      text: result.output.full_text,
      page_count: result.output.page_count || null
    });

  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});