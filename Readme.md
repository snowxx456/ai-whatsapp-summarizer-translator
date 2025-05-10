# WhatsApp AI Assistant Bot

A TypeScript-based WhatsApp chatbot that processes messages through AI function calling to provide translation and summarization capabilities.

## Overview

This project implements a WhatsApp bot that:

1. Receives messages from WhatsApp
2. Forwards them to an AI model via WebSocket
3. The AI determines the appropriate function to call (translate, summarize, or direct response)
4. Executes the function and returns the result to the user

### Communication Flow

```
Incoming WhatsApp message → WebSocket → AI function selection → Function execution → Response sent back to WhatsApp
```

## Features

- **Translation**: Translate text to different languages
- **Summarization**: Condense long text into concise summaries
- **Combined functionality**: Both translate and summarize in one operation
- **Natural conversation**: Handles general queries with direct AI responses

## Examples

### Summarize Text

**Input:**

```
summarize The AI business landscape is rapidly evolving, transforming industries across the globe by introducing innovative solutions and automating processes that were once time-consuming or labor-intensive. [...]
```

**Output:**

```
AI is rapidly transforming industries by automating processes, optimizing decision-making, and enhancing customer experiences across sectors like finance, healthcare, retail, and manufacturing. This leads to increased efficiency, innovation, and new business models. However, AI adoption requires investment in talent, infrastructure, and research, while addressing ethical concerns, job displacement, and privacy risks to achieve sustainable and responsible growth.
```

### Translate Text

**Input:**

```
translate to fr The AI business landscape is rapidly evolving, transforming industries across the globe [...]
```

**Output:**

```
Le paysage commercial de l'IA évolue rapidement, transformant les industries à travers le monde [...]
```

### Summarize and Translate

**Input:**

```
summarize and translate to es The AI business landscape is rapidly evolving [...]
```

**Output:**

```
La IA (Inteligencia Artificial) está transformando rápidamente las industrias automatizando procesos [...]
```

### General Conversation

**Input:**

```
hello bot
```

**Output:**

```
Hello! How can I help you today?
```

## Project Structure

```
├── src/
│   ├── types/           # TypeScript interfaces and types
│   ├── message.ts       # Message handling interfaces
│   ├── aiFunctionCalling.ts  # AI function calling implementation
│   ├── config.ts        # Configuration settings
│   ├── index.ts         # Application entry point
│   ├── tools.ts         # Tool implementations (translate, summarize)
│   ├── whatsappclient.ts # WhatsApp client integration
│   ├── ws.ts            # WebSocket implementation
├── .env                 # Environment variables
├── .gitignore
├── package-lock.json
├── package.json
├── tsconfig.json
└── README.md
```

## How It Works

1. **Message Reception**: The bot receives messages from WhatsApp users
2. **WebSocket Communication**: Messages are sent to a WebSocket server
3. **AI Processing**: The AI model (Gemini via LangChain) analyzes the message
4. **Function Selection**: Based on message content, the AI selects the appropriate function:
   - `translate`: Converts text to specified language
   - `summarize`: Creates a concise summary of lengthy text
   - Direct response for general queries
5. **Response Delivery**: The result is sent back to the user via WhatsApp

## Function-Calling Logic

The project uses LangChain to interface with Gemini AI for function calling. When a message is received:

1. The AI analyzes the content to determine user intent
2. If the message contains keywords like "translate" or "summarize", the AI selects the appropriate function
3. For translation, the AI identifies the target language and text to translate
4. For summarization, the AI processes the provided text to create a concise version
5. If both operations are requested (e.g., "summarize and translate to es"), the AI executes them sequentially
6. For general queries, the AI responds directly without calling a function

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- TypeScript
- WhatsApp account
- Gemini API key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/snowxx456/ai-whatsapp-summarizer-translator.git
cd ai-whatsapp-summarizer-translator
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
# Rename .env.local#example to .env
cp .env.local#example .env
```

4. Edit the `.env` file and add your Gemini API key:

```
GEMINI_API_KEY=your_api_key_here
```

You can get your Gemini API key from [`ai.google.dev`](https://ai.google.dev/gemini-api/docs/api-key)

5. (Optional) Configure allowed users in `config.ts`:

```typescript
export const allowedUsers: AllowedSender = {
  senders: [
    { id: "917016xxxxxx@c.us", name: "User Name" },
    // Add more users as needed
  ],
};

export const production: boolean = false, // Set to false to use allowedUsers filter
```

6. (Optional) Modify supported languages in `config.ts`:

```typescript
export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "hi", name: "Hindi" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
  { code: "ru", name: "Russian" },
];
```

Add more languages by including additional entries with the appropriate language code and name.

### Running the Application

Start the application using:

```bash
ts-node-dev src/index.ts
```

If that fails, try:

```bash
npx ts-node-dev src/index.ts
```

### WhatsApp Authentication

When you run the application for the first time, it will generate a QR code in the console. To authenticate:

1. Open WhatsApp on your phone
2. Go to Settings > Linked Devices
3. Tap on "Link a Device"
4. Scan the QR code displayed in your console
5. Once authenticated, the bot will be connected to your WhatsApp account

## Technologies Used

- **TypeScript**: For strongly-typed code implementation
- **LangChain**: Framework for connecting with Gemini AI
- **WebSocket**: For real-time communication
- **WhatsApp Client**: For message handling on WhatsApp
- **Gemini AI**: For natural language processing and function calling

## Limitations

- Currently supports translation and summarization only
- Limited to text-based responses
- Requires internet connection for AI processing

## Future Enhancements

- Add more language processing tools
- Implement multimedia content handling
- Improve response streaming for better user experience
- Add authentication and more robust security measures

## License

[MIT License](LICENSE)
