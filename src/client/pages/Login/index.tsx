import { login } from "../../services/ftpService";
import { Card } from "../../components";
import { Button, Form, FormProps, Input, message, Radio, Spin } from "antd";
import { CheckboxGroupProps } from "antd/es/checkbox";
import { PROTOCOL } from "../../../public/utils/enums";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { FTPConfig } from "../../../public/types/common";
import RESPONSE_CODE from "../../../public/utils/codes";
import { useNavigate } from "react-router-dom";
import { saveUserState } from "../../redux/slices/connectSlice"
import { useEffect, useState } from "react";
import { getConfig } from "../../services/configService";

import "./index.scss";

type FTPFieldType=FTPConfig&{protocol:PROTOCOL};

const options:CheckboxGroupProps<string>["options"]=[
  {label:"FTP",value:PROTOCOL.FTP},
];

export default function Login() { 
  const navigate=useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const dispatch=useAppDispatch();
  const connect=useAppSelector(s=>s.connect);
  const [form]=Form.useForm<FTPFieldType>();
  
  const [loading,setLoading]=useState<boolean>(false);

  useEffect(()=>{
    getConfig()
    ?.then(res=>{
      const {data,code}=res;
      const {ftp}=data;
      if(code===RESPONSE_CODE.SUCCESS){
        dispatch(saveUserState({
          config:ftp,
          protocol:PROTOCOL.FTP
        }));
      }

    }).catch(err=>{
      console.error("Failed to fetch config:",err);
    }).finally(()=>{
      setLoading(false);
    });
  },[]);

  useEffect(()=>{
    if(connect.config && connect.protocol){
      const {config,protocol}=connect;
      form.setFieldsValue({
        ...config,
        protocol
      });
    }

  },[connect])

  const onFinish:FormProps<FTPFieldType>["onFinish"]=values=>{
    setLoading(true);
    const {host,pass,port,protocol,user}=values;

    switch(protocol){
      case PROTOCOL.FTP:{
        const ftpConfig:FTPConfig={host,port,user,pass};
        login(ftpConfig)?.then(res=>{
          const {code,msg}=res;
          
          if(code===RESPONSE_CODE.SUCCESS){
            messageApi.success("Connected!");
            dispatch(saveUserState({
              config:ftpConfig,
              protocol
            }));
    
            navigate("/");
          }else{
            messageApi.error(msg);
          }
    
          setLoading(false);
        }).catch(err=>{
          console.error("Failed to login!",err);
          messageApi.error("Failed to login!");
        }).finally(()=>{
          setLoading(false);
        });

        break;
      }

      default:
        messageApi.error("Invalid protocol!");
        setLoading(false);
    }
  }

  return (
    <>
    {contextHolder}
    <div className="login-main">
      <Spin spinning={loading}>
        <Card className="login-card">
          <h2>连接到服务器</h2>

          <Form
            labelCol={{span:8}}
            wrapperCol={{span:16}}
            onFinish={onFinish}
            className="form-container"
            form={form}
          >
            <Form.Item<FTPFieldType>
              name="protocol"
              className="protocol-chooser"
              // rules={[
              //   {required:true,message:"Choose a protocol!"}
              // ]}
            >
              <Radio.Group
                block
                options={options}
                // optionType="button"
                // buttonStyle="solid"
              />
            </Form.Item>

            <div className="inputs-container">
              <Form.Item<FTPFieldType>
                label="服务器地址"
                name="host"
                required
                rules={[
                  {required:true,message:"Host not null!"}
                ]}
                className="form-item"
              >
                <Input />
              </Form.Item>

              <Form.Item<FTPFieldType>
                label="端口"
                name="port"
                required
                rules={[
                  {required:true,message:"Port not null!"}
                ]}
                className="form-item"
              >
                <Input type="number"/>
              </Form.Item>

              <Form.Item<FTPFieldType>
                label="用户"
                name="user"
                required
                rules={[
                  {required:true,message:"User not null!"}
                ]}
                className="form-item"
              >
                <Input />
              </Form.Item>

              <Form.Item<FTPFieldType>
                label="密码"
                name="pass"
                required
                rules={[
                  {required:true,message:"Password not null!"}
                ]}
                className="form-item"
              >
                <Input type="password"/>
              </Form.Item>
            </div>

            <div>
              <Form.Item>
                <Button 
                  htmlType="submit" 
                  type="primary"
                  disabled={loading}
                >
                  登录
                </Button>
              </Form.Item>
            </div>
          </Form>
        </Card>
      </Spin>
    </div>
    </>
  );
}
