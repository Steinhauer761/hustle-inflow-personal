import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const resumeFile = formData.get('resume');
    const coverLetterFile = formData.get('coverLetter');
    const jobTitle = formData.get('jobTitle');
    const company = formData.get('company');
    const notes = formData.get('notes');

    if (!resumeFile || !jobTitle || !company) {
      return Response.json({ error: 'Resume, job title, and company are required' }, { status: 400 });
    }

    // Upload resume
    const resumeBytes = await resumeFile.arrayBuffer();
    const resumeUpload = await base44.integrations.Core.UploadFile({
      file: {
        name: resumeFile.name,
        type: resumeFile.type,
        arrayBuffer: resumeBytes,
      },
    });

    // Upload cover letter if provided
    let coverLetterUrl = null;
    if (coverLetterFile) {
      const coverLetterBytes = await coverLetterFile.arrayBuffer();
      const coverLetterUpload = await base44.integrations.Core.UploadFile({
        file: {
          name: coverLetterFile.name,
          type: coverLetterFile.type,
          arrayBuffer: coverLetterBytes,
        },
      });
      coverLetterUrl = coverLetterUpload.file_url;
    }

    // Create application record
    const application = await base44.entities.JobApplication.create({
      job_title: jobTitle,
      company: company,
      resume_url: resumeUpload.file_url,
      cover_letter_url: coverLetterUrl,
      notes: notes || '',
      applied_date: new Date().toISOString().split('T')[0],
      status: 'submitted',
    });

    // Send confirmation email to user
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: `Application Submitted: ${jobTitle} at ${company}`,
      body: `Hi ${user.full_name || 'there'},\n\nYour application for ${jobTitle} at ${company} has been submitted successfully!\n\nWe've saved your resume and cover letter. You can track your application status in the Jobs Board.\n\nGood luck! 🍀\n\n— HustleINFlow Team`,
    });

    return Response.json({ 
      success: true, 
      applicationId: application.id,
      message: 'Application submitted successfully!' 
    });
  } catch (error) {
    console.error('Submit application error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});