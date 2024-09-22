import { readFile, utils, writeFile } from "xlsx";

var fileInput = document.getElementById("import");
var name = document.getElementById("districtCode");
var sheetNameInput = document.getElementById("sheet_name");
var fileNameInput = document.getElementById("file_name");
var transformButton = document.getElementById("transform_button");
console.log(fileInput);
// fileInput.onchange = () => {
//   handleImport(fileInput.files[0]).then((res) => {
//     let result = handleConvertion(res, districtInput.value);
//     // tableUI(result);
//     handleNewExcelFile(sheetNameInput.value, result, fileNameInput.value);
//     console.log(result);
//   });
// };

transformButton.addEventListener("click", () => {
  try {
    handleImport(fileInput.files[0]).then((res) => {
      let result = handleConvertion(res, name.value);
      handleNewExcelFile(
        `${name.value.split(" ").slice(0, 3).join(" ")}`,
        result,
        `${name.value}`
      );
      console.log(result);
    });
  } catch (error) {
    window.alert(error);
  }
});

function tableUI(datas) {
  let div = document.querySelector("#table");

  let table = `
    <div class="overflow-x-auto">
      <div class="py-2 inline-block">
        <div class="overflow-scroll">
        <table class="">
            <thead class="bg-white border-b">            
              <tr>
              ${Object.keys(datas[0])
                .map((x) => {
                  console.log(x);
                  return `<th scope="col" class="text-sm font-medium text-gray-900 py-4">
                  ${x}
                  </th>`;
                })
                .join()}                
              </tr>
            </thead>
            <tbody>
              ${datas
                .map((y) => {
                  return `<tr class="bg-white border-b transition duration-300 ease-in-out hover:bg-gray-100">${Object.values(
                    y
                  )
                    .map((x) => {
                      return `<td class="text-sm text-gray-900 font-light py-4 ">
                    ${x}
                    </td>`;
                    })
                    .join()}</tr>`;
                })
                .join()}
              <tr class="bg-white border-b transition duration-300 ease-in-out hover:bg-gray-100">
              
                <td class="text-sm text-gray-900 font-light py-4 whitespace-nowrap">
                  {{ $post->id }}
                </td>

                <td class="text-sm text-gray-900 font-light py-4 whitespace-nowrap">
                  {{ $post->title }}
                </td>

                <td class="text-sm text-gray-900 font-light py-4 whitespace-nowrap">
                  {{ $post->content }}
                </td>

              </tr>
            </tbody>
          </table>
        </div>
      </div>
  `;

  div.insertAdjacentHTML("beforebegin", table);
}

async function handleImport(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = readFile(arrayBuffer);
    const firstSheet = utils.sheet_to_json(
      result.Sheets[result.SheetNames[0]],
      { raw: false }
    );
    return firstSheet;
  } catch (error) {
    console.log(error);
  }
}

// function handleConvertion(fileArrays, districtCode) {
//   let result = [];
//   let res = fileArrays.reduce((acc, file) => {
//     file["First Name"] = spaceRemover(file["First Name"]);
//     file["Last Name"] = spaceRemover(file["Last Name"]);
//     var fullName = `${file["First Name"]} ${file["Last Name"]}`;

//     let accKey = Object.keys(acc);

//     if (accKey.length == 0) {
//       if (!acc[fullName]) {
//         acc[fullName] = [];
//       }

//       //acc[fullName][0] += acc[fullName].length
//       acc[fullName].push(file.Timestamp);
//     }

//     Object.keys(acc).forEach((element) => {
//       if (!areWordsSimilarWithMisspelling(fullName, element)) {
//         acc[fullName] = [];
//       }

//       if (areWordsSimilarWithMisspelling(fullName, element)) {
//         if (acc[element].indexOf(file.Timestamp) === -1) {
//           acc[element].push(file.Timestamp);
//         }
//       } else {
//         if (acc[fullName].indexOf(file.Timestamp) === -1) {
//           acc[fullName].push(file.Timestamp);
//         }
//       }
//     });

//     return acc;
//   }, {});

//   let keys = Object.keys(res);
//   let largestElement = 0;
//   let response = keys.map((x) => {
//     let value = [x, ...res[x]];
//     //let value = [x,...res[x], res[x].length]

//     largestElement =
//       res[x].length > largestElement ? res[x].length : largestElement;

//     return value;
//   });

//   response = response.map((x) => {
//     let value = [...x];
//     value = placeValueInArray(value, largestElement + 1, x.length - 1);

//     return value;
//   });
//   return response.sort((a, b) => b[largestElement + 1] - a[largestElement + 1]);
//   //return response;
// }

function handleConvertion(fileArrays, districtCode) {
  let result = [];
  let res = fileArrays.reduce((acc, file) => {
    file["First Name"] = spaceRemover(file["First Name"]);
    file["Last Name"] = spaceRemover(file["Last Name"]);
    var fullName = `${file["First Name"]} ${file["Last Name"]}`;

    if (!acc[fullName]) {
      acc[fullName] = [];
    }

    //acc[fullName][0] += acc[fullName].length
    acc[fullName].push(file.Timestamp);

    return acc;
  }, {});

  result.push(res);

  let keys = Object.keys(res);
  let largestElement = 0;
  let response = keys.map((x) => {
    let value = [x, ...res[x]];
    //let value = [x,...res[x], res[x].length]

    largestElement =
      res[x].length > largestElement ? res[x].length : largestElement;

    return value;
  });

  response = response.map((x) => {
    let value = [...x];
    value = placeValueInArray(value, largestElement + 1, x.length - 1);

    return value;
  });
  return response.sort((a, b) => b[largestElement + 1] - a[largestElement + 1]);
  //return response;
}

function placeValueInArray(arr, index, value) {
  // Ensure the array is long enough to accommodate the index
  while (arr.length <= index) {
    arr.push(""); // Fill with empty strings up to the index
  }

  // Set the value at the specified index
  arr[index] = value;

  return arr;
}

function handleNewExcelFile(sheetName, sheetDatas, fileName) {
  console.log(sheetDatas);
  const book = utils.book_new();
  const jsonToSheet = utils.json_to_sheet(sheetDatas);
  utils.book_append_sheet(book, jsonToSheet, sheetName);

  writeFile(book, `${fileName}.xlsx`);

  return {
    book,
    sheetDatas,
    sheetName,
    fileName,
  };
}

function spaceRemover(str) {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.toLowerCase().slice(1))
    .join("");
}

function levenshteinDistance(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const dp = Array(len2 + 1)
    .fill()
    .map(() => Array(len1 + 1).fill(0));

  // Initialize the matrix
  for (let i = 0; i <= len1; i++) dp[0][i] = i;
  for (let j = 0; j <= len2; j++) dp[j][0] = j;

  // Compute the Levenshtein distance
  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[j][i] = dp[j - 1][i - 1];
      } else {
        dp[j][i] = Math.min(dp[j - 1][i - 1], dp[j][i - 1], dp[j - 1][i]) + 1;
      }
    }
  }

  return dp[len2][len1];
}

function areWordsSimilarWithMisspelling(str1, str2, maxDistance = 10) {
  // Split both strings into words
  let words1 = str1.split(" ");
  let words2 = str2.split(" ");

  // Compare each word in words1 with words2 using Levenshtein distance
  for (let word1 of words1) {
    for (let word2 of words2) {
      const distance = levenshteinDistance(word1, word2);
      if (distance <= maxDistance) {
        return true; // Words are similar within the given distance
      }
    }
  }

  return false;
}
