// notify.js

(async () => {
  try {
    const failedTests = process.env.FAILED_TESTS_LIST
      ? process.env.FAILED_TESTS_LIST.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    const payload = {
      repository: process.env.GITHUB_REPOSITORY,
      run_id: process.env.GITHUB_RUN_ID,
      status: process.env.JOB_STATUS,
      event: process.env.GITHUB_EVENT_NAME,
      triggerSource: process.env.TRIGGER_SOURCE,
      testCaseId: process.env.TEST_CASE_ID,
      testRunId: process.env.TEST_RUN_ID,
      individualTestRunId: process.env.INDIVIDUAL_TEST_RUN_ID || null,
      timestamp: new Date().toISOString(),
      testResults: {
        total: parseInt(process.env.TOTAL_TESTS),
        passed: parseInt(process.env.PASSED_TESTS),
        failed: parseInt(process.env.FAILED_TESTS),
        failedTests: failedTests
      },
      nativeGitHubData: {
        workflow: {
          name: process.env.GITHUB_WORKFLOW,
          runNumber: process.env.GITHUB_RUN_NUMBER,
          actor: process.env.GITHUB_ACTOR
        },
        job: {
          status: process.env.JOB_STATUS
        }
      }
    };

    console.log('📦 Sending payload to TMS:');
    console.log(JSON.stringify(payload, null, 2));

    const res = await fetch(process.env.CALLBACK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.YOUTRACK_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`❌ Webhook failed: ${res.status} ${res.statusText}`);
      console.error(text);
      process.exit(1);
    } else {
      console.log('✅ Webhook delivered successfully');
      const responseText = await res.text();
      console.log('📄 Response:', responseText);
    }

  } catch (error) {
    console.error(`💥 Webhook delivery error: ${error.message}`);
    process.exit(1);
  }
})();
