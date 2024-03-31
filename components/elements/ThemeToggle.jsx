import React from "react";
import { Tooltip } from "antd";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";



export default class ThemeToggle extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      lightMode: false
    };
  }
  
  componentDidMount() {
    const userPrefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (!userPrefersDarkMode && !this.state.lightMode) {
      console.log("toggled2");
      this.toggleTheme();
    } else if (document.body.classList.contains("light-mode")) {
      this.setState({
        lightMode: true
      });
    }
  }

  toggleTheme = async () => {
    console.log("toggled");
    await this.setState({
      lightMode: !this.state.lightMode
    });
    document.body.classList.toggle("light-mode");
  };

  render() {
    return (
      <Tooltip
        title={`Toggle ${!this.state.lightMode ? "Light" : "Dark"} Mode`}
        placement="bottomRight"
        arrow={{pointAtCenter: true}}
        mouseEnterDelay={0.2}
      >
        <div className="toggle-container">
        {
          (this.state.lightMode) ?
            <SunOutlined onClick={this.toggleTheme}/>
            :
            <MoonOutlined onClick={this.toggleTheme}/>
        }
        </div>
      </Tooltip>
    );
  }
}