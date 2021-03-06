import Title from './components/Title';
import React from 'react'
import './App.css';

// const CAT1 = "https://cataas.com/cat/60b73094e04e18001194a309/says/react";
// const CAT2 = "https://cataas.com//cat/5e9970351b7a400011744233/says/inflearn";
// const CAT3 = "https://cataas.com/cat/595f280b557291a9750ebf65/says/JavaScript";
const jsonLocalStorage = {
  setItem: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
    // 저장 시 stringify : javascript 객체 or value를 json형태로 변환하여 저장
  },
  getItem: (key) => {
    return JSON.parse(localStorage.getItem(key));
    // 꺼낼 때 문자열을 javascript 객체로 변환
  },
};
const fetchCat = async (text) => {
  const OPEN_API_DOMAIN = "https://cataas.com";
  const response = await fetch(`${OPEN_API_DOMAIN}/cat/says/${text}?json=true`);
  const responseJson = await response.json();
  return `${OPEN_API_DOMAIN}/${responseJson.url}`;
};

const Form = ({ updateMainCat }) => {
  const [value, setValue] = React.useState('')
  const includesHangul = (text) => /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/i.test(text);
  const [errorMessage, setErrorMessage] = React.useState('')


  function handleInputChange(e) {
    const userValue = e.target.value
    setErrorMessage('')
    if (includesHangul(userValue)) {
      setErrorMessage('한글은 쓸 수 없습니다.')
    }
    setValue(e.target.value.toUpperCase())
  }

  function handleFormSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    if (value === '') {
      setErrorMessage('값을 입력해주세요')
      return;
    }
    updateMainCat(value);
    setValue('')

  }
  // form의 기본 동작은 제출 후 refresh 하는 것임.
  return (
    <form onSubmit={handleFormSubmit}>
      <input
        type="text"
        name="name"
        placeholder="영어 대사를 입력해주세요"
        onChange={handleInputChange}
        value={value}
      />
      <button type="submit">생성</button>
      {errorMessage === "" ? null :
        <p style={{ color: 'red' }}>{errorMessage}</p>}
    </form>
  )
}

// components 는 무조건 대문자 시작
function CatItem(props) {
  return (
    <li>
      <img src={props.img} style={{ width: "150px" }} alt="#" />
    </li>
  )
}

function Favorites({ favorites }) {
  // 조건부 렌더링
  if (favorites.length === 0) {
    return <div>사진 위 하트를 눌러 고양이 사진을 저장하세요!</div>
  }


  return (
    <ul className="favorites">
      {favorites.map(cat =>
        <CatItem img={cat} key={cat} />)}
    </ul>
  )
}

// event 이름을 지을 때, handle + 어쩌고 + event이름(click, mouseover)

const MainCard = ({ img, onHeartClick, alreadyFavorite }) => {
  const heartIcon = alreadyFavorite ? "💖" : "🤍"

  return (
    <div className="main-card">
      <img src={img} alt="고양이" width="400" />
      <button onClick={onHeartClick}>{heartIcon}</button>
    </div>
  )
}

// 하나의 변수를 react에서 element라고 함.


const App = () => {

  const [counter, setCounter] = React.useState(() =>
    jsonLocalStorage.getItem('counter')
  );
  // form 컴포넌트 안에서 쓰이던 상태를 상위에서 같이 쓰고 싶을 때, 상태를 끌어올리게 됨.
  // 부모 컴포넌트에서 상태 선언 후, 자식 컴포넌트에 props로 넘겨줌. 
  // 상태를 어디에 두는지는 답이 없음. 

  async function setInitialCat() {
    const newCat = await fetchCat('Welcome to Cat-jjal maker')
    setMainCat(newCat)
  }
  const [mainCat, setMainCat] = React.useState(setInitialCat)
  const [favorites, setFavorites] = React.useState(() =>
    jsonLocalStorage.getItem('favorites') || [])

  const alreadyFavorite = favorites.includes(mainCat)


  // app이 ui를 새로 그릴때마다 컴포넌트의 안의 모든 코드들이 호출됨.
  // 원하는 시점에만 호출하고 싶을 때, useEffect() 사용, 배열을 넘기고 원하는 상태를 넘겨줌.
  // 2번째 인자인 빈 배열[]은 컴포넌트가 맨처음 나타날 때만 불림. 다른 변수를 넣으면 해당 변수가 변경될 때마다 호출됨.
  React.useEffect(() => {
    setInitialCat()
  }, [])


  async function updateMainCat(text) {
    const newCat = await fetchCat(text)
    setMainCat(newCat)
    setCounter((prev) => {
      const nextCounter = prev + 1
      jsonLocalStorage.setItem('counter', nextCounter)
      return nextCounter
    })
  }
  function handleHeartClick() {
    const nextFavorites = [...favorites, mainCat]
    setFavorites(nextFavorites)
    jsonLocalStorage.setItem('favorites', nextFavorites)
  }

  const counterTitle = counter === null ? '' : counter + '번째 '

  // 함수 이름 짓기 컨벤션, handler는 handle ~ , 근데 props로 넘기면 on~
  return (
    <div>
      <Title> {counterTitle} 고양이 가라사대 </Title>
      <Form updateMainCat={updateMainCat} />
      <MainCard img={mainCat} onHeartClick={handleHeartClick} alreadyFavorite={alreadyFavorite} />
      <Favorites favorites={favorites} />
    </div>
  )
}

export default App;
