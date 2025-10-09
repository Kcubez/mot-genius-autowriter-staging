// Language Switcher for MOT Content Generator
// Supports Myanmar (my) and English (en) languages

// Language translations object
const translations = {
  // Navigation and Layout
  'Genius AutoWriter': {
    my: 'Genius AutoWriter',
  },
  'Content Generator': {
    my: 'Content Generator',
    en: 'Content Generator',
  },
  Dashboard: {
    my: 'မှတ်တမ်း',
    en: 'Dashboard',
  },
  Users: {
    my: 'အသုံးပြုသူများ',
    en: 'Users',
  },
  Generator: {
    my: 'ဖန်တီးရန်',
    en: 'Generator',
  },
  Logout: {
    my: 'ထွက်ရန်',
    en: 'Logout',
  },
  Administrator: {
    my: 'စီမံခန့်ခွဲသူ',
    en: 'Administrator',
  },
  'Content Creator': {
    my: 'Content ရေးသားသူ',
    en: 'Content Creator',
  },

  // Content Generation Form
  'Content Generation Form': {
    my: 'Content ဖန်တီးရေးသားရန်နေရာ',
    en: 'Content Generation Form',
  },
  'Fill in the details below': {
    my: 'အောက်ပါအချက်အလက်များကို ဖြည့်သွင်းပါ',
    en: 'Fill in the details below',
  },
  'Page Name': {
    my: 'Page အမည်',
    en: 'Page Name',
  },
  Topic: {
    my: 'အကြောင်းအရာ',
    en: 'Topic',
  },
  Purpose: {
    my: 'ရည်ရွယ်ချက်',
    en: 'Purpose',
  },
  Audience: {
    my: 'ပရိသတ်',
    en: 'Audience',
  },
  'Copywriting Model': {
    my: 'Copywriting ပုံစံ',
    en: 'Copywriting Model',
  },
  'Output Language': {
    my: 'ထွက်လာမည့်ဘာသာစကား',
    en: 'Output Language',
  },
  'Writing Style': {
    my: 'ရေးသားပုံစံ',
    en: 'Writing Style',
  },
  'Word Count': {
    my: 'စာလုံးအရေအတွက်',
    en: 'Word Count',
  },
  Keywords: {
    my: 'အဓိကစကားလုံးများ',
    en: 'Keywords',
  },
  Hashtags: {
    my: 'ဟက်ရှ်တက်များ',
    en: 'Hashtags',
  },
  'Call to Action (CTA)': {
    my: 'လုပ်ဆောင်ရန်တောင်းဆိုချက် (CTA)',
    en: 'Call to Action (CTA)',
  },
  'Negative Constraints': {
    my: 'မပါဝင်စေလိုသောအရာများ',
    en: 'Negative Constraints',
  },
  'Reference Links': {
    my: 'ကိုးကားလင့်များ',
    en: 'Reference Links',
  },
  'Include Emojis': {
    my: 'Emoji များထည့်ရန်',
    en: 'Include Emojis',
  },
  'Generate Content': {
    my: 'Content ဖန်တီးရန်',
    en: 'Generate Content',
  },
  'Save Content': {
    my: 'Content သိမ်းဆည်းရန်',
    en: 'Save Content',
  },

  // Form Options
  'None (General)': {
    my: 'မရွေးချယ် (ယေဘုယျ)',
    en: 'None (General)',
  },
  'မြန်မာ (Myanmar)': {
    my: 'မြန်မာ (Myanmar)',
    en: 'Myanmar (Burmese)',
  },
  English: {
    my: 'အင်္ဂလိပ်',
    en: 'English',
  },

  // Buttons and Actions
  'Add Link': {
    my: 'လင့်ထည့်ရန်',
    en: 'Add Link',
  },
  ON: {
    my: 'ဖွင့်',
    en: 'ON',
  },
  OFF: {
    my: 'ပိတ်',
    en: 'OFF',
  },

  // Messages and Notifications
  'Content generated successfully!': {
    my: 'Content ကို အောင်မြင်စွာ ဖန်တီးပြီးပါပြီ!',
    en: 'Content generated successfully!',
  },
  'Content saved successfully!': {
    my: 'Content ကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ!',
    en: 'Content saved successfully!',
  },
  Success: {
    my: 'အောင်မြင်',
    en: 'Success',
  },
  Saved: {
    my: 'သိမ်းဆည်းပြီး',
    en: 'Saved',
  },

  // Login Form
  'Login to Your Account': {
    my: 'သင့်အကောင့်သို့ ဝင်ရောက်ပါ',
    en: 'Login to Your Account',
  },
  'Email Address': {
    my: 'အီးမေးလ်လိပ်စာ',
    en: 'Email Address',
  },
  Password: {
    my: 'စကားဝှက်',
    en: 'Password',
  },
  'Gemini API Key': {
    my: 'Gemini API Key',
    en: 'Gemini API Key',
  },
  Login: {
    my: 'ဝင်ရောက်ရန်',
    en: 'Login',
  },

  // Placeholders
  'Page ၏ အမည် သို့မဟုတ် Brand အမည်': {
    my: 'Page ၏ အမည် သို့မဟုတ် Brand အမည်',
    en: 'Page name or Brand name',
  },
  'ဒီနေရာတွင် content ၏ အဓိက အကြောင်းအရာကို ရေးပါ': {
    my: 'ဒီနေရာတွင် content ၏ အဓိက အကြောင်းအရာကို ရေးပါ',
    en: 'Enter the main topic of your content here',
  },
  'ဥပမာ - ပညာပေးရန်၊ Engagement ရရှိရန်၊ ရောင်းအားမြှင့်တင်ရန်': {
    my: 'ဥပမာ - ပညာပေးရန်၊ Engagement ရရှိရန်၊ ရောင်းအားမြှင့်တင်ရန်',
    en: 'Example - To educate, Get engagement, Boost sales',
  },
  'ဥပမာ - အသက် ၂၀ မှ ၃၀ ကြား လူငယ်တွေ': {
    my: 'ဥပမာ - အသက် ၂၀ မှ ၃၀ ကြား လူငယ်တွေ',
    en: 'Example - Young people aged 20 to 30',
  },
  'ဥပမာ - ၁၀၀ မှ ၅၀၀ စကားလုံး': {
    my: 'ဥပမာ - ၁၀၀ မှ ၅၀၀ စကားလုံး',
    en: 'Example - 100 to 500 words',
  },
  'ဥပမာ - အစားအသောက်၊ ကျန်းမာရေး၊ နည်းပညာ': {
    my: 'ဥပမာ - အစားအသောက်၊ ကျန်းမာရေး၊ နည်းပညာ',
    en: 'Example - Food, Health, Technology',
  },
  'ဥပမာ - #အစားအစာ #ကျန်းမာရေး #မြန်မာ': {
    my: 'ဥပမာ - #အစားအစာ #ကျန်းမာရေး #မြန်မာ',
    en: 'Example - #food #healthy #myanmar',
  },
  'ဥပမာ - ယခုပင် မှာယူပါ၊ ဆက်သွယ်ပါ၊ ကြည့်ရှုပါ': {
    my: 'ဥပမာ - ယခုပင် မှာယူပါ၊ ဆက်သွယ်ပါ၊ ကြည့်ရှုပါ',
    en: 'Example - Order now, Contact us, Watch now',
  },
  'မပါဝင်စေလိုသော စကားလုံးများ သို့မဟုတ် အကြောင်းအရာများ': {
    my: 'မပါဝင်စေလိုသော စကားလုံးများ သို့မဟုတ် အကြောင်းအရာများ',
    en: 'Words or topics you want to avoid',
  },
  'Website URL ထည့်ပါ': {
    my: 'Website URL ထည့်ပါ',
    en: 'Enter website URL',
  },
  'Generated content will appear here...': {
    my: 'ဖန်တီးထားသော content ကို ဒီနေရာမှာ ပြပါမယ်...',
    en: 'Generated content will appear here...',
  },
  'ရွေးချယ်ပါ...': {
    my: 'ရွေးချယ်ပါ...',
    en: 'Select...',
  },

  // Additional UI Text
  'Website links စတာတွေ ထည့်နိုင်ပါတယ်။ Genius AutoWriter က ဒီ links တွေကို reference အနေနဲ့ သုံးပြီး content ရေးပေးပါမယ်။':
    {
      my: 'Website links တွေ ထည့်နိုင်ပါတယ်။ Genius AutoWriter က ဒီ links တွေကို reference အနေနဲ့ သုံးပြီး content ရေးပေးပါမယ်။',
      en: 'You can add website links, etc. Genius AutoWriter will use these links as references to write content.',
    },
  'Content မှာ emoji တွေ ထည့်မလား မထည့်မလား': {
    my: 'Content မှာ emoji တွေ ထည့်မလား မထည့်မလား',
    en: 'Whether to include emojis in content or not',
  },

  // Form Labels and Options
  'Keywords (separate keywords with commas)': {
    my: 'အဓိကစကားလုံးများ (ကော်မာဖြင့် ပိုင်းခြားပါ)',
    en: 'Keywords (separate keywords with commas)',
  },
  Hashtags: {
    my: 'ဟက်ရှ်တက်များ',
    en: 'Hashtags',
  },
  'Call to Action (CTA)': {
    my: 'လုပ်ဆောင်ရန်တောင်းဆိုချက် (CTA)',
    en: 'Call to Action (CTA)',
  },
  'Negative Constraints': {
    my: 'မပါဝင်စေလိုသောအရာများ',
    en: 'Negative Constraints',
  },
  'Reference Links': {
    my: 'ကိုးကားလင့်များ',
    en: 'Reference Links',
  },
  'Upload an image (Optional):': {
    my: 'ပုံတစ်ပုံ ထည့်ပါ (မဖြစ်မနေ မလိုအပ်ပါ):',
    en: 'Upload an image (Optional):',
  },
  'Generated Content:': {
    my: 'ဖန်တီးထားသော Content:',
    en: 'Generated Content:',
  },
  'View My Contents': {
    my: 'Content ကြည့်ရန်',
    en: 'View My Contents',
  },

  // Toggle States
  ON: {
    my: 'ဖွင့်',
    en: 'ON',
  },
  OFF: {
    my: 'ပိတ်',
    en: 'OFF',
  },

  // Dashboard Elements
  'Content Generator': {
    my: 'Content Generator',
    en: 'Content Generator',
  },
  'Create content with advanced customization': {
    my: 'အဆင့်မြင့် customization ဖြင့် content ဖန်တီးပါ',
    en: 'Create content with advanced customization',
  },
  'Total Contents': {
    my: 'စုစုပေါင်း Content များ',
    en: 'Total Contents',
  },
  'Recent Content': {
    my: 'လတ်တလော Content များ',
    en: 'Recent Content',
  },
  'View All': {
    my: 'အားလုံးကြည့်ရန်',
    en: 'View All',
  },

  // Dashboard Page Elements
  'My Contents': {
    my: 'ကျွန်ုပ်၏ Content များ',
    en: 'My Contents',
  },
  'Manage all your created content': {
    my: 'သင်ဖန်တီးထားသော content အားလုံးကို စီမံခန့်ခွဲပါ',
    en: 'Manage all your created content',
  },

  // Content Library Elements
  'Content Library': {
    my: 'Content စာကြည့်တိုက်',
    en: 'Content Library',
  },
  'Total:': {
    my: 'စုစုပေါင်း:',
    en: 'Total:',
  },
  Title: {
    my: 'ခေါင်းစဉ်',
    en: 'Title',
  },
  Purpose: {
    my: 'ရည်ရွယ်ချက်',
    en: 'Purpose',
  },
  Created: {
    my: 'ဖန်တီးသည့်ရက်',
    en: 'Created',
  },
  Updated: {
    my: 'ပြင်ဆင်သည့်ရက်',
    en: 'Updated',
  },
  Actions: {
    my: 'လုပ်ဆောင်ချက်များ',
    en: 'Actions',
  },

  // Action Buttons
  View: {
    my: 'ကြည့်ရန်',
    en: 'View',
  },
  Edit: {
    my: 'ပြင်ဆင်ရန်',
    en: 'Edit',
  },
  Delete: {
    my: 'ဖျက်ရန်',
    en: 'Delete',
  },

  // Delete Modal
  'Delete Content': {
    my: 'Content ဖျက်ရန်',
    en: 'Delete Content',
  },
  'Are you sure you want to delete this content? This action cannot be undone.': {
    my: 'ဒီ content ကို ဖျက်ချင်တာ သေချာပါသလား? ဒီလုပ်ဆောင်ချက်ကို ပြန်ပြင်လို့ မရပါဘူး။',
    en: 'Are you sure you want to delete this content? This action cannot be undone.',
  },
  Cancel: {
    my: 'ပယ်ဖျက်ရန်',
    en: 'Cancel',
  },

  // Edit Content Page
  'Edit Content': {
    my: 'Content ပြင်ဆင်ရန်',
    en: 'Edit Content',
  },
  'Update your content details': {
    my: 'သင့် content အသေးစိတ်များကို ပြင်ဆင်ပါ',
    en: 'Update your content details',
  },
  Content: {
    my: 'Content',
    en: 'Content',
  },
  'Update Content': {
    my: 'Content ပြင်ဆင်ရန်',
    en: 'Update Content',
  },

  // View Content Page
  'Not specified': {
    my: 'မသတ်မှတ်ထားပါ',
    en: 'Not specified',
  },
  'Copy Content': {
    my: 'Content ကူးယူရန်',
    en: 'Copy Content',
  },
  'Back to History': {
    my: 'မှတ်တမ်းသို့ ပြန်သွားရန်',
    en: 'Back to History',
  },
  'Writing Style': {
    my: 'စာရေးပုံစံ',
    en: 'Writing Style',
  },
  Keywords: {
    my: 'အဓိကစကားလုံးများ',
    en: 'Keywords',
  },

  // Toast Messages
  'Content saved successfully!': {
    my: 'Content ကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ!',
    en: 'Content saved successfully!',
  },
  'Content updated successfully!': {
    my: 'Content ကို အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ!',
    en: 'Content updated successfully!',
  },
  'Content deleted successfully!': {
    my: 'Content ကို အောင်မြင်စွာ ဖျက်ပြီးပါပြီ!',
    en: 'Content deleted successfully!',
  },
  'Content copied to clipboard!': {
    my: 'Content ကို clipboard သို့ ကူးယူပြီးပါပြီ!',
    en: 'Content copied to clipboard!',
  },
  'Error generating content. Please try again.': {
    my: 'Content ဖန်တီးရာတွင် အမှားရှိပါသည်။ ကျေးဇူးပြု၍ ထပ်မံကြိုးစားပါ။',
    en: 'Error generating content. Please try again.',
  },
  'Please fill in all required fields.': {
    my: 'လိုအပ်သော အကွက်များအားလုံးကို ဖြည့်စွက်ပါ။',
    en: 'Please fill in all required fields.',
  },
  'Login successful!': {
    my: 'အောင်မြင်စွာ ဝင်ရောက်ပြီးပါပြီ!',
    en: 'Login successful!',
  },
  'Invalid credentials. Please try again.': {
    my: 'အထောက်အထား မှားယွင်းနေပါသည်။ ကျေးဇူးပြု၍ ထပ်မံကြိုးစားပါ။',
    en: 'Invalid credentials. Please try again.',
  },

  // Login Page
  'Welcome Back': {
    my: 'ပြန်လည်ကြိုဆိုပါတယ်',
    en: 'Welcome Back',
  },
  'Sign in to your Genius AutoWriter account': {
    my: 'သင့် Genius AutoWriter အကောင့်သို့ ဝင်ရောက်ပါ',
    en: 'Sign in to your Genius AutoWriter account',
  },
  Email: {
    my: 'အီးမေးလ်',
    en: 'Email',
  },
  Password: {
    my: 'စကားဝှက်',
    en: 'Password',
  },
  'API Key': {
    my: 'API Key',
    en: 'API Key',
  },
  'Sign In': {
    my: 'ဝင်ရောက်ရန်',
    en: 'Sign In',
  },

  // Error Messages
  'Password cannot contain spaces': {
    my: 'စကားဝှက်တွင် space မပါရပါ',
    en: 'Password cannot contain spaces',
  },
  'Please use a Gmail address (@gmail.com)': {
    my: 'Gmail လိပ်စာကို အသုံးပြုပါ (@gmail.com)',
    en: 'Please use a Gmail address (@gmail.com)',
  },

  // Placeholders
  'Enter your email': {
    my: 'သင့်အီးမေးလ် ရိုက်ထည့်ပါ',
    en: 'Enter your email',
  },
  'Enter your password': {
    my: 'သင့်စကားဝှက် ရိုက်ထည့်ပါ',
    en: 'Enter your password',
  },
  'Enter your Gemini API Key': {
    my: 'သင့် Gemini API Key ရိုက်ထည့်ပါ',
    en: 'Enter your Gemini API Key',
  },

  // Word Count Options
  'Word Count': {
    my: 'စာလုံးအရေအတွက်',
    en: 'Word Count',
  },
  Short: {
    my: 'တို',
    en: 'Short',
  },
  Medium: {
    my: 'လတ်',
    en: 'Medium',
  },
  Long: {
    my: 'ရှည်',
    en: 'Long',
  },

  // Generate Button States
  'Generate Content': {
    my: 'Content ဖန်တီးရန်',
    en: 'Generate Content',
  },
  'Generating...': {
    my: 'ဖန်တီးနေသည်...',
    en: 'Generating...',
  },

  // Save Content Modal
  'Save Content': {
    my: 'Content သိမ်းဆည်းရန်',
    en: 'Save Content',
  },
  'Enter a title for this content:': {
    my: 'ဒီ content အတွက် ခေါင်းစဉ် ထည့်ပါ:',
    en: 'Enter a title for this content:',
  },
  'OK': {
    my: 'အိုကေ',
    en: 'OK',
  },

  // Copywriting Models
  'None (General)': {
    my: 'မရွေးချယ် (ယေဘုယျ)',
    en: 'None (General)',
  },
  'AIDA (Attention, Interest, Desire, Action)': {
    my: 'AIDA (အာရုံစိုက်မှု၊ စိတ်ဝင်စားမှု၊ လိုချင်မှု၊ လုပ်ဆောင်မှု)',
    en: 'AIDA (Attention, Interest, Desire, Action)',
  },
  'PAS (Problem, Agitate, Solution)': {
    my: 'PAS (ပြဿနာ၊ နှိုးဆွမှု၊ ဖြေရှင်းချက်)',
    en: 'PAS (Problem, Agitate, Solution)',
  },
  'FAB (Features, Advantages, Benefits)': {
    my: 'FAB (လုပ်ဆောင်ချက်များ၊ အားသာချက်များ၊ အကျိုးကျေးဇူးများ)',
    en: 'FAB (Features, Advantages, Benefits)',
  },
  '4Ps (Picture, Promise, Prove, Push)': {
    my: '4Ps (ပုံရိပ်၊ ကတိ၊ သက်သေ၊ တွန်းအား)',
    en: '4Ps (Picture, Promise, Prove, Push)',
  },
  'BAB (Before, After, Bridge)': {
    my: 'BAB (မတိုင်မီ၊ ပြီးနောက်၊ တံတား)',
    en: 'BAB (Before, After, Bridge)',
  },

  // Writing Styles
  'ဖော်ရွေသော (Friendly)': {
    my: 'ဖော်ရွေသော',
    en: 'Friendly',
  },
  'တရားဝင် (Formal)': {
    my: 'တရားဝင်',
    en: 'Formal',
  },
  'ဟာသ (Humorous)': {
    my: 'ဟာသ',
    en: 'Humorous',
  },
  'ယုံကြည်မှုရှိသော (Confident)': {
    my: 'ယုံကြည်မှုရှိသော',
    en: 'Confident',
  },
  'စိတ်အားထက်သန်သော (Enthusiastic)': {
    my: 'စိတ်အားထက်သန်သော',
    en: 'Enthusiastic',
  },
  'ပရော်ဖက်ရှင်နယ် (Professional)': {
    my: 'ပရော်ဖက်ရှင်နယ်',
    en: 'Professional',
  },
  'စကားပြောပုံစံ (Conversational)': {
    my: 'စကားပြောပုံစံ',
    en: 'Conversational',
  },
  'ဇာတ်လမ်းပြောပုံစံ (Narrative)': {
    my: 'ဇာတ်လမ်းပြောပုံစံ',
    en: 'Narrative',
  },
  'အသိပေးရှင်းပြပုံစံ (Expository)': {
    my: 'အသိပေးရှင်းပြပုံစံ',
    en: 'Expository',
  },
  'စည်းရုံးဆွဲဆောင်ပုံစံ (Persuasive)': {
    my: 'စည်းရုံးဆွဲဆောင်ပုံစံ',
    en: 'Persuasive',
  },

  // Footer Text
  'Powered by Myanmar Online Technology': {
    my: 'Myanmar Online Technology မှ ပံ့ပိုးထားသည်',
    en: 'Powered by Myanmar Online Technology',
  },

  // Admin Login
  'Admin Login': {
    my: 'Admin ဝင်ရောက်ရန်',
    en: 'Admin Login',
  },
  'Sign in to admin panel': {
    my: 'Admin panel သို့ ဝင်ရောက်ပါ',
    en: 'Sign in to admin panel',
  },
};

// Get current language from localStorage or default to Myanmar
let currentLanguage = localStorage.getItem('language') || 'my';

// Initialize language switcher
document.addEventListener('DOMContentLoaded', function () {
  const languageSelector = document.getElementById('language-selector');

  if (languageSelector) {
    // Set initial language
    languageSelector.value = currentLanguage;
    applyLanguage(currentLanguage);

    // Add change event listener
    languageSelector.addEventListener('change', function () {
      const selectedLanguage = this.value;
      currentLanguage = selectedLanguage;
      localStorage.setItem('language', selectedLanguage);
      applyLanguage(selectedLanguage);
    });
  }
});

// Apply language to all translatable elements
function applyLanguage(language) {
  // Update all elements with data-translate attribute
  const translatableElements = document.querySelectorAll('[data-translate]');

  translatableElements.forEach(element => {
    const key = element.getAttribute('data-translate');
    if (translations[key] && translations[key][language]) {
      if (element.tagName === 'INPUT' && element.type === 'submit') {
        element.value = translations[key][language];
      } else if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
        element.placeholder = translations[key][language];
      } else {
        element.textContent = translations[key][language];
      }
    }
  });

  // Update placeholders
  const placeholderElements = document.querySelectorAll('[data-placeholder]');
  placeholderElements.forEach(element => {
    const key = element.getAttribute('data-placeholder');
    if (translations[key] && translations[key][language]) {
      element.placeholder = translations[key][language];
    }
  });

  // Update translate-placeholder elements
  const translatePlaceholderElements = document.querySelectorAll('[data-translate-placeholder]');
  translatePlaceholderElements.forEach(element => {
    const key = element.getAttribute('data-translate-placeholder');
    if (translations[key] && translations[key][language]) {
      element.placeholder = translations[key][language];
    }
  });

  // Update document language attribute
  document.documentElement.lang = language === 'my' ? 'my' : 'en';

  // Update dynamically created reference link placeholders
  const referenceLinkInputs = document.querySelectorAll(
    'input[data-placeholder="Website URL ထည့်ပါ"]'
  );
  referenceLinkInputs.forEach(input => {
    const key = input.getAttribute('data-placeholder');
    if (translations[key] && translations[key][language]) {
      input.placeholder = translations[key][language];
    }
  });
}

// Function to get translation
function getTranslation(key, lang = currentLanguage) {
  if (translations[key] && translations[key][lang]) {
    return translations[key][lang];
  }
  return key; // Return original key if translation not found
}

// Export for use in other scripts
window.getTranslation = getTranslation;
window.currentLanguage = currentLanguage;
