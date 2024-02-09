import React, { useState } from "react";
import "./App.css";
import htmlDocx from "html-docx-js/dist/html-docx";
import { saveAs } from "file-saver";

export default function App() {
  const [text, setFileText] = useState(null);
  const [loading, setloading] = useState(false);
  const [filename, setfilename] = useState("");

  let words = [];
  const bodyText = [];
  const htmldoc = [];

  const checkUnderLinedWords = (words) => {
    return words.filter((word) => word.tag == "u");
  };

  const checkItalicWords = (words) => {
    return words.filter((word) => word.tag == "em");
  };

  const checkBoldWords = (words) => {
    const bold = words.filter((word) => word.tag == "strong");
    return bold;
  };

  const handleFileSelect = (event) => {
    words = [];
    const file = event.target.files[0];
    if (file) {
      setfilename(file.name);
    }

    setloading(true);
    const formData = new FormData();
    formData.append("file", file);

    fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.text())
      .then((html) => {
        setFileText(html);
        setloading(false);
      });
  };

  if (text) {
    let subArray = [];
    let count = 0;

    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    const nodes = doc.body.childNodes;

    const bodycontent = doc.body.textContent.trim();

    const bodytextt = bodycontent.split(/\s+/);
    let subarrays = [];

    for (let i = 0; i < bodytextt.length; i++) {
      subarrays.push(bodytextt[i]);
      if (subarrays.length === 1000 || i == bodytextt.length - 1) {
        bodyText.push(subarrays);
        subarrays = [];
      }
    }

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.nodeType === Node.TEXT_NODE) {
        const textContent = node.textContent.trim();
        if (textContent !== "") {
          const splitText = textContent.split(/[,\s]+/);
          for (let j = 0; j < splitText.length; j++) {
            if (subArray.length >= 1000) {
              words.push(subArray);
              subArray = [];
            }
            subArray.push({ tag: "p", text: splitText[j] });
          }
        }
      } else {
        if (node.childNodes.length > 0) {
          for (let m = 0; m < node.childNodes.length; m++) {
            if (subArray.length >= 1000) {
              words.push(subArray);
              subArray = [];
            }

            const subchildnode = node.childNodes[m];

            if (subchildnode.childNodes.length > 0) {
              for (let k = 0; k < subchildnode.childNodes.length; k++) {
                if (subArray.length >= 1000) {
                  words.push(subArray);
                  subArray = [];
                }
                if (
                  subchildnode.childNodes[k].nodeType === 1 &&
                  (subchildnode.childNodes[k].nodeName === "STRONG" ||
                    subchildnode.childNodes[k].nodeName === "U" ||
                    subchildnode.childNodes[k].nodeName === "EM")
                ) {
                  // const secondchildcontent = subchildnode.childNodes[k].textContent.trim()

                  // const secondchildText = secondchildcontent?.split(/[,\s]+/);

                  // for (let l = 0; l < secondchildText.length; l++) {
                  //   if (subArray.length >= 1000) {
                  //     words.push(subArray);
                  //     subArray = [];
                  //   }

                  subArray.push({
                    tag: subchildnode.childNodes[k].nodeName.toLowerCase(),
                    text: subchildnode.childNodes[k].innerText,
                  });

                  // }
                }
              }
            }

            const childcontent = subchildnode.textContent.trim();

            const childText = childcontent.split(/[,\s]+/);

            for (let j = 0; j < childText.length; j++) {
              if (subArray.length >= 1000) {
                words.push(subArray);
                subArray = [];
              }

              if (
                subchildnode.nodeType === 1 &&
                (subchildnode.nodeName === "STRONG" ||
                  subchildnode.nodeName === "U" ||
                  subchildnode.nodeName === "EM")
              ) {
                if (childText[j] !== "") {
                  subArray.push({
                    tag: subchildnode.nodeName.toLowerCase(),
                    text: childText[j],
                  });
                }
              }
              if (subchildnode.nodeType == 3) {
                subArray.push({
                  tag: subchildnode.nodeName.toLowerCase(),
                  text: childText[j],
                });
              }
            }
          }
        } else {
          const textContent = node.textContent.trim();

          const splitText = textContent.split(/[,\s]+/);

          for (let j = 0; j < splitText.length; j++) {
            if (subArray.length >= 1000) {
              words.push(subArray);
              subArray = [];
            }
            if (
              splitText[j] !== "" ||
              splitText[j] !== "'" ||
              splitText[j] !== "," ||
              splitText[j] !== " :" ||
              splitText[j] !== "?" ||
              splitText[j] !== ";" ||
              splitText[j] !== "." ||
              splitText[j] !== "”" ||
              splitText[j] !== "," ||
              splitText[j] !== "!" ||
              splitText[j] !== "“" ||
              splitText[j] !== "—" ||
              splitText[j] !== " ." ||
              splitText[j] !== " .’"
            ) {
              subArray.push({ tag: node.nodeName, text: splitText[j] });
            }
          }
        }
      }
    }
    if (subArray.length > 0) {
      words.push(subArray);
    }
  }

  const downloaddoc = () => {
    const htmlContent = window.document.documentElement.outerHTML;

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");

    // get all button and label elements and remove them
    const button = doc.querySelector("button");
    const label = doc.querySelector("label");

    if (button && label) {
      button.remove();
      label.remove();
    }

    // convert the modified document back to an HTML string
    const serializer = new XMLSerializer();
    const modifiedHtmlContent = serializer.serializeToString(
      doc.documentElement
    );

    const converted = htmlDocx.asBlob(modifiedHtmlContent);

    saveAs(converted, filename);
  };

  return (
    <>
      <div id="mydocument" className="App">
        <>
          {" "}
          <input
            type="file"
            name="file"
            id="file"
            className="inputfile"
            onChange={handleFileSelect}
          />
          <label style={{ width: "200px" }} htmlFor="file">
            Choose a doc file
          </label>
        </>
        {words.length ? (
          <button className="btnstyle" onClick={downloaddoc}>
            download file
          </button>
        ) : (
          ""
        )}

        {loading ? (
          <div className="loader"></div>
        ) : (
          <div style={{ marginTop: "150px" }}>
            {words.length && bodyText.length ? (
              words.length > 1 ? (
                words
                  .map((elem) => elem)
                  .map((item, index) => {
                    const UnderLinedWords = checkUnderLinedWords(item);
                    const italicWords = checkItalicWords(item);
                    const BoldWords = checkBoldWords(item);

                    return (
                      <div>
                        <h1 style={{ width: "100%", textAlign: "center" }}>
                          {" "}
                          1000 words{" "}
                        </h1>
                        <p
                          style={{
                            maxWidth: "100vw",
                            overflow: "hidden",
                            textAlign: "justify",
                          }}
                        >
                          {bodyText[index]?.join(" ' ")}{" "}
                        </p>

                        <div>
                          {" "}
                          <h3>italicWords : {italicWords?.length} </h3>{" "}
                          {italicWords?.map((word) => {
                            return (
                              <span style={{ fontStyle: "italic" }}>
                                {word.text},{" "}
                              </span>
                            );
                          })}
                        </div>
                        <div>
                          {" "}
                          <h3>
                            UnderLinedWords : {UnderLinedWords?.length}{" "}
                          </h3>{" "}
                          {UnderLinedWords?.map((word) => {
                            return (
                              <span style={{ textDecoration: "underline" }}>
                                {word.text},{" "}
                              </span>
                            );
                          })}
                        </div>
                        <div>
                          {" "}
                          <h3>BoldWords : {BoldWords?.length}</h3>{" "}
                          {BoldWords?.map((word) => {
                            return (
                              <span style={{ fontWeight: "bold" }}>
                                {word.text},{" "}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
              ) : (
                words.map((item, index) => {
                  const UnderLinedWords = checkUnderLinedWords(item);
                  const italicWords = checkItalicWords(item);
                  const BoldWords = checkBoldWords(item);

                  return (
                    <div>
                      <h1 style={{ width: "100%", textAlign: "center" }}>
                        {" "}
                        1000 words{" "}
                      </h1>
                      <p
                        style={{
                          maxWidth: "100vw",
                          overflow: "hidden",
                          textAlign: "justify",
                        }}
                      >
                        {bodyText[index]?.join(" ' ")}{" "}
                      </p>

                      <div>
                        {" "}
                        <h3>italicWords : {italicWords?.length} </h3>{" "}
                        {italicWords?.map((word) => {
                          return (
                            <span style={{ fontStyle: "italic" }}>
                              {word.text},{" "}
                            </span>
                          );
                        })}
                      </div>
                      <div>
                        {" "}
                        <h3>
                          UnderLinedWords : {UnderLinedWords?.length}{" "}
                        </h3>{" "}
                        {UnderLinedWords?.map((word) => {
                          return (
                            <span style={{ textDecoration: "underline" }}>
                              {word.text},{" "}
                            </span>
                          );
                        })}
                      </div>
                      <div>
                        {" "}
                        <h3>BoldWords : {BoldWords?.length}</h3>{" "}
                        {BoldWords?.map((word) => {
                          return (
                            <span style={{ fontWeight: "bold" }}>
                              {word.text},{" "}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              <div></div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
