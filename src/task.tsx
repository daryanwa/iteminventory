const mockResponses: Record<string, string> = {
  "file1.txt": `Hello world! : 2024-02-22 14:35:30 UTC
      Goodbye world! : 2024-02-22 16:35:30 UTC
      Hello? : 2024-02-22 08:35:30 UTC
     Hi : 2024-02-22 12:35:30 UTC`,
  "file2.txt": `How are you doing ? : 2024-02-22 13:59:30 UTC
      Fine : 2024-02-22 12:44:30 UTC
      How about you ? : 2024-02-22 22:35:30 UTC
      Same : 2024-02-22 07:39:30 UTC`,
  "file3.txt": `Have you seen high elves ? : 2022-02-22 14:35:30 UTC
      HESOYAM : 2023-02-22 14:35:30 UTC
      BAGUVIX : 2021-02-22 14:35:30 UTC
      THERE IS NO SPOON : 2020-02-22 14:35:30 UTC`,
};

interface IMessage {
  send: (message: IParserMessage, filepath: string) => Promise<void>;
}

interface IParser {
  parse: (content: string) => IParserMessage[];
}

interface IFileFetcher {
  fetch: (filepath: string) => Promise<string>;
}

interface IFileWriter {
  write: (filepath: string, content: string) => Promise<void>;
}

interface IParserMessage {
  message: string;
  timestamp: string;
}

const mockFetch = async (
  filePath: string,
  params?: { body: string; method: string }
): Promise<string> => {
  if (params?.method === "POST") return "";
  return mockResponses[filePath] ?? "";
};

const LONG_MESSAGE = "long";
const SHORT_MESSAGE = "short";
const POST_METHOD = "POST";

class FileFetch implements IFileFetcher {
  async fetch(filepath: string): Promise<string> {
    return mockFetch(filepath);
  }
}

class FileWriter implements IFileWriter {
  async write(filepath: string, content: string): Promise<void> {
    await mockFetch(filepath, { body: content, method: POST_METHOD });
  }
}

class Parser implements IParser {
  parse(content: string): IParserMessage[] {
    return content.split("\n").map((line) => {
      const [message, timestamp] = line.trim().split(" : ");
      return { message, timestamp };
    });
  }
}

class ParserMessage implements IMessage {
  private writer: IFileWriter;

  constructor(writer: IFileWriter) {
    this.writer = writer;
  }

  async send(message: IParserMessage, filepath: string): Promise<void> {
    const delay = Math.random() * 5000;
    await new Promise<void>((resolve) => setTimeout(resolve, delay));
    const content = JSON.stringify({
      ...message,
      type: message.message.length > 8 ? LONG_MESSAGE : SHORT_MESSAGE,
    });
    await this.writer.write(filepath, content);
    console.log(`${message.message} : ${message.timestamp} `);
  }
}

class FileHandler {
  private fetcher: IFileFetcher;
  private parser: IParser;
  private processor: IMessage;

  constructor(fetcher: IFileFetcher, parser: IParser, processor: IMessage) {
    this.fetcher = fetcher;
    this.parser = parser;
    this.processor = processor;
  }

  async handle(inputFile: string, outputFile: string): Promise<void> {
    try {
      const content = await this.fetcher.fetch(inputFile);
      const messages = this.parser.parse(content);
      const waitGroup = messages.map((message) =>
        this.processor.send(message, outputFile)
      );
      await Promise.all(waitGroup);
    } catch (error) {
      console.error(`Error processing file ${inputFile}: ${error}`);
    }
  }
}

export const main = async () => {
  const files = {
    "file1.txt": "out1.txt",
    "file2.txt": "out2.txt",
    "file3.txt": "out3.txt",
  };

  const fetcher = new FileFetch();
  const writer = new FileWriter();
  const parser = new Parser();
  const processor = new ParserMessage(writer);
  const handler = new FileHandler(fetcher, parser, processor);

  const waitGroup = Object.entries(files).map(([input, output]) =>
    handler.handle(input, output)
  );
  await Promise.all(waitGroup);
};

main();
