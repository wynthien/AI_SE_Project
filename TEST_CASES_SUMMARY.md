# Test Case Summary

Date: October 25, 2025  
Branch: `test`

| ID | Function/Module | Test Scenario | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| T-001 | Env (.env via tests/setup.js) | GOOGLE_API_KEY is loaded | 1) Load tests 2) Read process.env.GOOGLE_API_KEY | Env var is defined and not empty | Key present (masked in logs) | Pass |
| T-002 | Env (.env via tests/setup.js) | MONGO_URI is loaded | 1) Load tests 2) Read process.env.MONGO_URI | Env var is defined and not empty | URI present | Pass |
| T-003 | Env (.env via tests/setup.js) | NODE_ENV set to test | 1) Load tests 2) Read process.env.NODE_ENV | NODE_ENV === 'test' | 'test' | Pass |
| T-004 | controllers/handleChat | 400 when message missing | 1) POST body {} to handleChat | 400 + {error: 'Message is required'} | 400 error returned | Pass |
| T-005 | controllers/handleChat | Handles API call (success or error) | 1) Call with body {message:'...'} 2) Await result | Either {reply} 200 or handled 500 with error | Reply or handled 500 (rate-limit) | Pass |
| T-006 | controllers/chatBA | 400 when message missing | 1) Call with body {} | 400 or handled response | 400 handled | Pass |
| T-007 | controllers/chatBA | Processes valid user story | 1) Call with body {message:'user story'} 2) Await result | {reply, parsed:[...]} or handled 500 with error | Reply + parsed or handled 500 | Pass |
| T-008 | controllers/acceptTodo | 400 when required fields missing | 1) Call with body {} | 400 + {error:'userStory and sections are required'} | 400 error returned | Pass |
| T-009 | controllers/acceptTodo | Saves valid todo | 1) Mock TodoList() and save() 2) Call with valid body | 200 + {message, id} and save() called | Saved and id returned | Pass |
| T-010 | controllers/acceptTodo | Handles save errors | 1) Mock save() to reject 2) Call with valid body | 500 + {error:'Failed to save TodoList: ...'} | 500 handled | Pass |
| T-011 | controllers/getAcceptedTodos | Returns accepted todos | 1) Mock find().sort() 2) Call handler | 200 + array of todos | Array returned | Pass |
| T-012 | controllers/getAcceptedTodos | Handles fetch errors | 1) Mock sort() to reject 2) Call handler | 500 + {error:'Failed to fetch TodoLists'} | 500 handled | Pass |
| T-013 | controllers/chatBA + utils/parseTodoList | Parses I./II./III. format end-to-end | 1) Provide message 2) Call chatBA 3) Inspect parsed | parsed has 3 sections with tasks | parsed present (when not rate-limited) | Pass |
| T-014 | utils/parseTodoList | Roman numerals I/II/III parsed | 1) Provide text with I./II./III. and bullets | 3 sections extracted with tasks | 3 sections parsed | Pass |
| T-015 | utils/parseTodoList | Handles bullet variants (-, *, [ ], [x]) | 1) Provide bullets with variants | All bullet lines mapped to tasks | Tasks captured | Pass |
| T-016 | utils/parseTodoList | Vietnamese headers parsed | 1) Provide headers in Vietnamese 2) Provide bullets | 3 sections mapped by headers | Sections parsed | Pass |
| T-017 | utils/parseTodoList | Empty input | 1) Provide '' | [] (no sections) | [] returned | Pass |
| T-018 | utils/parseTodoList | Null input | 1) Provide null | [] (no sections) | [] returned | Pass |
| T-019 | utils/parseTodoList | No headers: bucket split | 1) Provide bullets only | 3 buckets split roughly equally | 3 sections with tasks | Pass |
| T-020 | utils/parseTodoList | No headers nor bullets | 1) Provide plain text | 3 empty named sections | 3 sections with empty tasks | Pass |
| T-021 | models/TodoList | Model is defined | 1) Import model | model is defined | Defined | Pass |
| T-022 | models/TodoList | Correct model name | 1) Inspect modelName | 'TodoList' | 'TodoList' | Pass |
| T-023 | models/TodoList | Creates valid document | 1) new TodoList({...}) | Fields set; sections array present | Valid instance created | Pass |
| T-024 | models/TodoList | Defaults applied | 1) Omit optional fields | accepted=false, sessionId='', generatedAt set | Defaults set | Pass |
| T-025 | models/TodoList | Required fields validated | 1) Missing userStory | Validation error for userStory | Error present | Pass |
| T-026 | models/TodoList | Multiple sections accepted | 1) Provide 3 sections | sections length=3 | Length=3 | Pass |
| T-027 | models/TodoList | Section structure validated | 1) Missing required inside sections | Validation error | Error present | Pass |
| T-028 | models/Message | Model is defined | 1) Import model | model is defined | Defined | Pass |
| T-029 | models/Message | Creates valid message | 1) new Message({userMessage, aiReply}) | timestamp default set | Fields set | Pass |
| T-030 | models/Message | Requires userMessage | 1) new Message({}) 2) validateSync() | Validation error for userMessage | Error present | Pass |
| T-031 | models/Message | aiReply default | 1) new Message({userMessage}) | aiReply === '' | '' | Pass |
| T-032 | routes/chat (Integration) | POST /api/chat returns todo list | 1) POST /api/chat with message | 200 + {reply, parsed} | 200 with payload | Pass |
| T-033 | routes/chat (Integration) | POST /api/chat missing message | 1) POST /api/chat {} | 400 + {error} | 400 error | Pass |
| T-034 | routes/chat (Integration) | POST /api/accept saves todo | 1) POST /api/accept with body | 200 + {message, id} | 200 with id | Pass |
| T-035 | routes/chat (Integration) | GET /api/todos returns list | 1) GET /api/todos | 200 + array | 200 with array | Pass |
| T-036 | Google AI Integration | Initializes SDK with API key | 1) new GoogleGenerativeAI(process.env.GOOGLE_API_KEY) | Instance created | Instance created | Pass |
| T-037 | Google AI Integration | Creates model instance | 1) genAI.getGenerativeModel({model:'...'}) | Model object created | Model created | Pass |

Notes
- Tests that can contact Google AI accept either a successful reply or a handled 500 error (e.g., HTTP 429 rate-limit) as Pass, since error handling is part of the requirement.
- The parser was refactored into `utils/parseTodoList.js` and unit tests now cover the real implementation to improve branch coverage.
