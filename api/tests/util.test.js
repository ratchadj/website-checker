import * as Utils from "../utils";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

import { size_s } from "./fixtures/csv";

describe("CSVToArray", () => {
  it("should return empty array if data is null", () => {
    const input = null;
    expect(Utils.CSVToArray(input)).toEqual([]);
  });
  it("should return empty array if data is undefined", () => {
    const input = undefined;
    expect(Utils.CSVToArray(input)).toEqual([]);
  });
  it("should return array if data is csv", () => {
    const input = size_s;
    expect(Utils.CSVToArray(input)).toEqual([
        'https://www.youtube.com',
        'http://www.google.com',
        'https://www.facebook.com',
        'www.twitter.com',
        'https://www.wikipedia.org',
        'https://www.instagram.com',
        'https://www.instag777ram.com',
        'www.sanook.com',
      ]);
  });

  it("should return array if data is csv", () => {
    const input = "https://www.youtube.com|http://www.google.com|https://www.facebook.com|";
    expect(Utils.CSVToArray(input)).toEqual(["https://www.youtube.com|http://www.google.com|https://www.facebook.com|"]);
  });
});

describe("bufferToString", () => {
  it("should return empty string if data is null", () => {
    const input = null;
    expect(Utils.bufferToString(input)).toEqual("");
  });
  it("should return empty string if data is undefined", () => {
    const input = undefined;
    expect(Utils.bufferToString(input)).toEqual("");
  });
  it("should return string if data is buffer", () => {
    const buffer = Buffer.from("test buffer transform");
    expect(Utils.bufferToString(buffer)).toEqual("test buffer transform");
  });
});

describe("websiteChecker", () => {
  let mock;

  beforeAll(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  describe("when API call is successful", () => {
    const testCaes = [
      {
        caseName: "https protocol",
        inputUrl: "https://www.youtube.com/",
        expectedUrl: "https://www.youtube.com/",
        expectedStatus: 200,
      },
      {
        caseName: "http protocol",
        inputUrl: "http://www.youtube.com/",
        expectedUrl: "http://www.youtube.com/",
        expectedStatus: 200,
      },
      {
        caseName: "no protocol",
        inputUrl: "www.youtube.com/",
        expectedUrl: "https://www.youtube.com/",
        expectedStatus: 200,
      },
    ];
    test.each(testCaes)(
      "should support all these url format : $caseName",
      async ({ caseName, inputUrl, expectedUrl, expectedStatus }) => {
        // given
        mock
          .onGet(expectedUrl)
          .reply(200, {
            message: "",
            status: expectedStatus,
            url: expectedUrl,
          });

        // when
        const result = Utils.websiteChecker(inputUrl);

        // then
        await expect(result).resolves.toEqual({
          message: "",
          status: expectedStatus,
          url: expectedUrl,
        });
      }
    );
  });

  describe("when API call is failed", () => {
    it("timeout", async () => {
      const url = "https://www.youtube.com/";
      // given
      mock.onGet(url).timeout();

      // when
      const result = Utils.websiteChecker(url);

      // then
      await expect(result).rejects.toEqual({
        message: "ECONNABORTED",
        status: 500,
        url: "https://www.youtube.com/",
      });
    });
    it("incorrect url", async () => {
        const url = "https://www.youtube.com|https://www.facebook.com|";
        // given
        mock.onGet(url).timeout();
  
        // when
        const result = Utils.websiteChecker(url);
  
        // then
        await expect(result).rejects.toEqual({
          message: undefined,
          status: 500,
          url: "https://www.youtube.com|https//www.facebook.com|",
        });
      });
  });
});
