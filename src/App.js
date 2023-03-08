import React, { useRef, useState } from "react";
import Moveable from "react-moveable";
import axios from "axios";
const API = "https://jsonplaceholder.typicode.com/photos";

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);

  const apiService = axios.create({
    baseURL: `${API}`,
  });
  function getPhoto(randomPhoto) {
    return apiService
      .get(`/${randomPhoto}`)
      .then((photo) => photo.data)
      .catch((error) => error);
  }

  const addMoveable = async () => {
    // Create a new moveable component and add it to the array
    const randomPhoto = Math.floor(Math.random() * 5000);
    const photo = await getPhoto(randomPhoto);
    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: photo.url,
        updateEnd: true,
      },
    ]);
  };
  const removeMoveable = async () => {

    if(selected){
      // console.log('selected: ', selected);
      const newMoveableComponents = [...moveableComponents]
      // console.log('newMoveableComponents: ', newMoveableComponents);
      function obtenerIndexID(obj,id){
        
        for (let i = 0; i < obj.length; i++) {
         if(obj[i].id===id){
          return i;
         }
        }
      }
   const index=obtenerIndexID(newMoveableComponents,selected)
      newMoveableComponents.splice(index,1);
      setMoveableComponents(newMoveableComponents)
    }else{
      console.log("nada seleccionado")
    }


  };

  const updateMoveable = (
    id,
    newComponent,
    updateEnd = false,
    parentBounds = false
  ) => {

    //Bounds on Y
    let componentY;
    const realTop = parentBounds.height - newComponent.height;
    if (newComponent.top < 0) {
      componentY = 0;
    } else if (newComponent.top > realTop) {
      componentY = realTop;
    } else {
      componentY = newComponent.top;
    }
    newComponent.top = componentY;

    //Bounds on X
    let componentX;
    const realLeft = parentBounds.width - newComponent.width;
    if (newComponent.left < 0) {
      componentX = 0;
    } else if (newComponent.left > realLeft) {
      componentX = realLeft;
    } else {
      componentX = newComponent.left;
    }
    newComponent.left = componentX;

    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  const handleResizeStart = (index, e) => {
    // console.log("e", e.direction);
    // Check if the resize is coming from the left handle
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosX === -1) {
      // console.log("width", moveableComponents, e);
      // Save the initial left and width values of the moveable component
      const initialLeft = e.left;
      const initialWidth = e.width;
      // Set up the onResize event handler to update the left value based on the change in width
    }
  };

  return (
    <main style={{ height: "100vh", width: "100vw" }}>
      <button onClick={addMoveable}>Add Moveable1</button>
      <button onClick={removeMoveable}>Remove Moveable1</button>
      <div
        id="parent"
        style={{
          position: "relative",
          background: "black",
          height: "80vh",
          width: "80vw",
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected}
            isSelected={selected === item.id}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  color,
  id,
  setSelected,
  isSelected = false,
  updateEnd,
}) => {
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    id,
  });

  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();

  const onResize = async (e) => {
    // ACTUALIZAR ALTO Y ANCHO
    let newWidth = e.width;
    let newHeight = e.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;
    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      color,
    });

    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
    });
  };

  const onResizeEnd = async (e) => {
    let newWidth = e.lastEvent?.width;
    let newHeight = e.lastEvent?.height;
    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;
    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    const { lastEvent } = e;
    const { drag } = lastEvent;
    const { beforeTranslate } = drag;

    const absoluteTop = top + beforeTranslate[1];
    const absoluteLeft = left + beforeTranslate[0];
    updateMoveable(
      id,
      {
        top: top,
        left: left,
        width: newWidth,
        height: newHeight,
        color,
      },
      true
    );
  };

  return (
    <>
      <div
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          backgroundImage: `url(${color})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
        onClick={() => setSelected(id)}
      />

      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        onDrag={(e) => {
          updateMoveable(
            id,
            {
              top: e.top,
              left: e.left,
              width,
              height,
              color,
            },
            false,
            parentBounds
          );
        }}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
    </>
  );
};
