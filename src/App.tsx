import Cropper from "@components/Cropper";
import { Container, HStack, IconButton, Text, useColorMode, VStack } from "@chakra-ui/react";
import { AiFillGithub } from "react-icons/ai";
import { MdDarkMode, MdLightMode } from "react-icons/md";

const REPO_URL = "https://github.com/Ac3NiNjA/cropweb";

function App() {
  const { colorMode } = useColorMode();

  return (
    <Container maxW={"container.lg"} pt={3} className={colorMode}>
      <Header />
      <Cropper />
    </Container>
  );
}

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const isLightMode = colorMode === "light";

  return (
    <HStack alignItems={"inherit"}>
      <VStack spacing={"-1"} px={"1"} alignItems={"inherit"} flex={1}>
        <Text fontSize={["xl", "2xl"]} fontWeight={"bold"}>
          Crop Web
        </Text>
        <Text fontSize={["large", "xl"]}>A simple tool to crop images in your browser.</Text>
      </VStack>

      <VStack>
        <a href={REPO_URL} target="_blank" aria-label={"View source code"} rel={"noreferrer"}>
          <AiFillGithub />
        </a>
        <IconButton
          style={{ boxShadow: "none" }}
          variant={"ghost"}
          aria-label={`Switch to ${isLightMode ? "dark" : "light"} mode`}
          onClick={toggleColorMode}
          icon={isLightMode ? <MdDarkMode /> : <MdLightMode />}
        />
      </VStack>
    </HStack>
  );
};

export default App;
