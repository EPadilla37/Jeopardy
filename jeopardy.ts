
import axios from 'axios'; 
let NUM_CATEGORIES: number  = 6 
let NUM_CLUES_PER_CAT:number = 5
let catIds:number[]= []; 
let clueArray: string[] = []; 
let categories: (string | number)[] = [];
let clue: string[] = []; 

  


async function getCatId():Promise<number[]>{
  let response = await axios.get(
    `http://jservice.io/api/categories?count=6`
  );
  let catIds = response.data.map(c => c.id); 
  return _.sampleSize(catIds, NUM_CATEGORIES);  
}


async function getByCategories(catId: number | string): Promise<{ title: string, clues: { question: string, answer: string, showing: null }[] }> {
  let response = await axios.get(`http://jservice.io/api/category?id=${catId}`);
  let allClues: { question: string; answer: string }[] = response.data.clues;
  let randomClues = _.sampleSize(allClues, NUM_CLUES_PER_CAT);
  let clues: { question: string; answer: string; showing: null }[] = randomClues.map(
    (c: { question: string; answer: string }) => ({
      question: c.question,
      answer: c.answer,
      showing: null,
    })
  );

  return { title: response.data.title, clues };
}

async function fillTable(): Promise<void> { 
  $("#jeopardy thead").empty();
  const $tr = $("<tr>");
  for (let catIdx = 0; catIdx < NUM_CATEGORIES; catIdx++) {
    $tr.append($("<th>").text(categories[catIdx].title));
  }
  $("#jeopardy thead").append($tr);

  // Add rows with questions for each category
  $("#jeopardy tbody").empty();
  for (let clueIdx = 0; clueIdx < NUM_CLUES_PER_CAT; clueIdx++) {
    const $tr = $("<tr>");
    for (let catIdx = 0; catIdx < NUM_CATEGORIES; catIdx++) {
      $tr.append($("<td>").attr("id", `${catIdx}-${clueIdx}`).text("?"));
    }
    $("#jeopardy tbody").append($tr);
  }
}

function handleClick(evt): void {
  const id = evt.target.id;
  const [catId, clueId] = id.split("-");
  
  const clue = categories[catId].clues[clueId];

  let msg: string;

  if (!clue.showing) {
    msg = clue.question;
    clue.showing = "question";
  } else if (clue.showing === "question") {
    msg = clue.answer;
    clue.showing = "answer";
  } else {
    // already showing answer; ignore
    return;
  }

  $(`#${catId}-${clueId}`).html(msg);
}


async function setupAndStart() {
  let catIds = await getCatId();
  categories = [];

  for (let catId of catIds) {
    categories.push(await getByCategories(catId));
  }

  fillTable();
}


$("#restart").on("click", setupAndStart);


$(async function () {
    setupAndStart();
    $("#jeopardy").on("click", "td", handleClick);
  }
);



